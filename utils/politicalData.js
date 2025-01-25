export async function fetchPoliticalLeaders(countryCode) {
    try {
        const searchResponse = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${countryCode}&language=en&format=json&origin=*&type=item&limit=1`);
        const searchData = await searchResponse.json();
        
        if (!searchData.search || searchData.search.length === 0) {
            throw new Error('Country not found');
        }

        const countryId = searchData.search[0].id;
        const leadersResponse = await fetch(`https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&property=P6&entity=${countryId}&origin=*`);
        const leadersData = await leadersResponse.json();

        const processedData = await processWikidataResponse(leadersData);
        return processedData;

    } catch (error) {
        console.error('Error fetching political data:', error);
        throw error;
    }
}

async function processWikidataResponse(data) {
    if (!data.claims || !data.claims.P6) {
        return [];
    }

    try {
        const leaderIds = [];
        const partyIds = new Set();
        const leaderToParty = new Map();

        data.claims.P6.forEach(claim => {
            const leaderId = claim.mainsnak.datavalue.value.id;
            leaderIds.push(leaderId);
        });

        const leaderBatchResponse = await fetch(
            `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|claims&ids=${leaderIds.join('|')}&languages=en&origin=*`
        );
        const leaderBatchData = await leaderBatchResponse.json();

        Object.values(leaderBatchData.entities).forEach(entity => {
            if (entity.claims && entity.claims.P102) {
                const partyId = entity.claims.P102[0].mainsnak.datavalue.value.id;
                partyIds.add(partyId);
                leaderToParty.set(entity.id, partyId);
            }
        });

        const partyBatchResponse = await fetch(
            `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&ids=${Array.from(partyIds).join('|')}&languages=en&origin=*`
        );
        const partyBatchData = await partyBatchResponse.json();

        const leaders = data.claims.P6.map(claim => {
            const leaderId = claim.mainsnak.datavalue.value.id;
            const startDate = claim.qualifiers.P580[0].datavalue.value.time;
            const endDate = claim.qualifiers.P582 ? claim.qualifiers.P582[0].datavalue.value.time : null;
            
            const parseWikidataDate = (dateString) => {
                return parseInt(dateString.substring(1, 5));
            };

            const partyId = leaderToParty.get(leaderId);
            const party = partyId && partyBatchData.entities[partyId]?.labels?.en?.value || 'Unknown Party';

            return {
                name: leaderBatchData.entities[leaderId].labels.en.value,
                position: 'Head of Government',
                startDate: parseWikidataDate(startDate),
                endDate: endDate ? parseWikidataDate(endDate) : new Date().getFullYear(),
                party: party
            };
        });

        return leaders
            .sort((a, b) => b.startDate - a.startDate)
            .filter((leader, index, self) => 
                index === self.findIndex((l) => l.name === leader.name)
            );

    } catch (error) {
        console.error('Error processing leaders batch:', error);
        return [];
    }
}
