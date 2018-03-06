// Parameters 



// DataLogic
$(document).ready(function () {
    getSimpleQueryResult();
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', getSimpleQueryResult);
});


// Elements of data logic
function getSimpleQueryResult() {

    var queryText = "<QueryPacket xmlns='urn:Microsoft.Search.Query' Revision='1000'>"
        queryText += "<Query>"
            queryText += "<Context>"
            queryText += "<QueryText language='en-US' type='STRING'>"
            queryText += "Estonia";
            queryText += "</QueryText>"
            queryText += "</Context>"
        queryText += "</Query>"
    queryText += "</QueryPacket>";

    $().SPServices({
        operation: "Query",
        queryXml: queryText,
        completefunc: function (xData, Status) {
            if (Status == "success") {
                $(xData.responseXML).find("QueryResult").each(function () {
                    //let's see what the response looks like
                    $("#SearchResult").text($(this).text());
                });
            }
            else {
                    HandleBCPError("error in search", "error in search", "error in search", "get window");
                }
            }
        });
}
