// initialising
$(document).ready(function () {
    $("#btnCreate").bind("click", function () {
        createSubSiteTest();
    });
});

function createSubSiteTest() {

    var webUrl = _spPageContextInfo.webAbsoluteUrl;

    var siteTitle = "test";
    var siteDesc = "test";
    var siteUrl = siteTitle.replace(/\s/g, "");
    var clientContext = new SP.ClientContext.get_current();
    //var clientContext = new SP.ClientContext(webUrl);
    this.oWebsite = clientContext.get_web();
    var webCreationInfo = new SP.WebCreationInformation();
    webCreationInfo.set_title(siteTitle);
    webCreationInfo.set_description(siteDesc);
    webCreationInfo.set_language(1033);
    webCreationInfo.set_url(siteUrl);
    webCreationInfo.set_useSamePermissionsAsParentSite(false);
    webCreationInfo.set_webTemplate("STS#0");

    oWebsite.get_webs().add(webCreationInfo);
    oWebsite.update();

    clientContext.executeQueryAsync(
        Function.createDelegate(this,
            function () { alert("success"); }),
        Function.createDelegate(this,
            function (sender, args) { alert("error"); }));
}



function createSite() {

    var siteTitle = "test";
    var siteDesc = "test";
    var siteUrl = siteTitle.replace(/\s/g, "");

    $.ajax({
        url: "/_api/web/webinfos/add",
        type: "POST",
        headers: {
            "accept": "application/json;odata=verbose",
            "content-type": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        data: JSON.stringify({
            'parameters': {
                '__metadata': {
                    'type': 'SP.WebInfoCreationInformation'
                },
                'Url': siteUrl,
                'Title':siteTitle,
                'Description': siteTitle,
                'Language': 1033,
                'WebTemplate': 'sts',
                'UseUniquePermissions': false
            }
        }),
        error: function (returnval) {
            alert("error");
        },
        success: function (returnval) {
            alert("success");
        },
        always: function() {
            alert("complete");
        },
        complete: function(jqXHR) {
        if(jqXHR.readyState === 4) {
            alert("success ?");
        }
    } 
    });
}
