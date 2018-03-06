// Parameters 


// cache variables - TODO implement
var DivisionList;
var SectionList;
var LegalEntityList;
var UnitList;
var LocationList;

// global parameters
var WebTemplateID;
var newSiteUrl;
var waitScreen;

// initialising
$(document).ready(function () {
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', BindParameters);
    $("#btnCreateBCP").bind("click", function () {
        var webUrl = _spPageContextInfo.webAbsoluteUrl;
        WaitDialog(webUrl);
        createBCPListItem();
    });
});

//UI Bind function
function BindParameters() {
    // TODO: caching the parameters !!, it is uncached at the moment

    // populating template ID
    getWebTemplateID();

    // Loading division table
    LoadParameterTableDivision();
    LoadParameterTableSection();
    LoadParameterTableUnit();
    LoadParameterTableEntity();
    LoadParameterTableLocation();
}


// Data Access - Location
function LoadParameterTableLocation() {
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var CAMLQuery = "<ViewFields>"
    CAMLQuery += "<FieldRef Name='" + ColumnLocationEN + "' />";
    CAMLQuery += "</ViewFields>";

    $().SPServices({
        operation: "GetListItems",
        webURL: webUrl,
        async: false,
        listName: LOCATIONLISTNAME,
        CAMLViewFields: CAMLQuery,
        completefunc: function (xData, status) {
            if (status == "success") {
                console.log("Location parameter successfully loaded");
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    var itemID = $(this).attr("ows_ID");
                    var liHtml = "<option value='" + itemID + ";#" + $(this).attr("ows_" + ColumnLocationEN) + "' >" + $(this).attr("ows_" + ColumnLocationEN) + "</option>";
                    $("#sel_Location").append(liHtml);
                });
            }
            else {
                if (waitScreen != null){
                    waitScreen.close();
                }
                HandleBCPError("Error", "appl_createbcp.js - LoadParameterTableLocation", xData.responseText);
            }
        }
    });
}


// Data Access - Entity
function LoadParameterTableEntity() {
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var CAMLQuery = "<ViewFields>"
    CAMLQuery += "<FieldRef Name='" + ColumnEntityEN + "' />";
    CAMLQuery += "</ViewFields>";

    $().SPServices({
        operation: "GetListItems",
        webURL: webUrl,
        async: false,
        listName: ENTITYLISTNAME,
        CAMLViewFields: CAMLQuery,
        completefunc: function (xData, status) {
            if (status == "success") {
                console.log("Entity parameter successfully loaded");
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    var itemID = $(this).attr("ows_ID");
                    var liHtml = "<option value='" + itemID + ";#" + $(this).attr("ows_" + ColumnEntityEN) + "' >" + $(this).attr("ows_" + ColumnEntityEN) + "</option>";
                    $("#sel_LegalEntity").append(liHtml);
                });
            }
            else {
                if (waitScreen != null) {
                    waitScreen.close();
                }
                HandleBCPError("Error", "appl_createbcp.js - LoadParameterTableEntity", xData.responseText);
            }
        }
    });
}


// Data Access - Unit
function LoadParameterTableUnit() {
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var CAMLQuery = "<ViewFields>"
    CAMLQuery += "<FieldRef Name='" + ColumnUnitNameEN + "' />";
    CAMLQuery += "</ViewFields>";

    $().SPServices({
        operation: "GetListItems",
        webURL: webUrl,
        async: false,
        listName: UNITLISTNAME,
        CAMLViewFields: CAMLQuery,
        completefunc: function (xData, status) {
            if (status == "success") {
                console.log("Unit parameter successfully loaded");
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    var itemID = $(this).attr("ows_ID");
                    var liHtml = "<option value='" + itemID + ";#" + $(this).attr("ows_" + ColumnUnitNameEN) + "' >" + $(this).attr("ows_" + ColumnUnitNameEN) + "</option>";
                    $("#sel_UnitName").append(liHtml);
                });
            }
            else {
                if (waitScreen != null) {
                    waitScreen.close();
                }
                HandleBCPError("Error", "appl_createbcp.js - LoadParameterTableUnit", xData.responseText);
            }
        }
    });
}

// Data Access - Session
function LoadParameterTableSection() {
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var CAMLQuery = "<ViewFields>"
    CAMLQuery += "<FieldRef Name='" + ColumnSessionNameEN + "' />";
    CAMLQuery += "</ViewFields>";

    $().SPServices({
        operation: "GetListItems",
        webURL: webUrl,
        async: false,
        listName: SESSIONLISTNAME,
        CAMLViewFields: CAMLQuery,
        completefunc: function (xData, status) {
            if (status == "success") {
                console.log("Section parameter successfully loaded");
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    var itemID = $(this).attr("ows_ID");
                    var liHtml = "<option value='" + itemID + ";#" + $(this).attr("ows_" + ColumnSessionNameEN) + "' >" + $(this).attr("ows_" + ColumnSessionNameEN) + "</option>";
                    $("#sel_SectionName").append(liHtml);
                });
            }
            else {
                if (waitScreen != null) {
                    waitScreen.close();
                }
                HandleBCPError("Error", "appl_createbcp.js - LoadParameterTableSection", xData.responseText);
            }
        }
    });
}


// Data Access - Division
function LoadParameterTableDivision() {
    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var CAMLQuery = "<ViewFields>"
    CAMLQuery += "<FieldRef Name='" + ColumnDivisionEN + "' />";
    CAMLQuery += "</ViewFields>";

    $().SPServices({
        operation: "GetListItems",
        webURL: webUrl,
        async: false,
        listName: DIVISIONLISTNAME,
        CAMLViewFields: CAMLQuery,
        completefunc: function (xData, status) {
            if (status == "success") {
                console.log("Division parameter successfully loaded");
                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    var itemID = $(this).attr("ows_ID");
                    var liHtml = "<option value='" + itemID +";#" + $(this).attr("ows_" + ColumnDivisionEN) + "' >" + $(this).attr("ows_" + ColumnDivisionEN) + "</option>";
                    $("#sel_DivisionName").append(liHtml);
                });
            }
            else {
                if (waitScreen != null) {
                    waitScreen.close();
                }
                HandleBCPError("Error", "appl_createbcp.js - LoadParameterTableDivision", xData.responseText);
            }
        }
    });
}

// populating webtemplate ID
function getWebTemplateID()
{
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    context.load(web);
    var webTemplates = web.getAvailableWebTemplates(1033, false);
    var subWebs = web.get_webs();
    context.load(webTemplates);
    context.executeQueryAsync(function () {
        var enumerator = webTemplates.getEnumerator();
        var customTemplate;
        while (enumerator.moveNext()) {
            var webTemplate = enumerator.get_current();
            var webTitle = webTemplate.get_title();
            if (webTitle == SiteTemplateName) {
                var _title = webTemplate.get_title();
                var _name = webTemplate.get_name();
                var _id = webTemplate.get_id();
                var _desc = webTemplate.get_description();

                WebTemplateID = _name;
                break;
            }
        }
    }, function (sender, args) {
        HandleBCPError(args.get_message(), "appl_createbcp.js - createBCPSubSite", args.get_stackTrace());
    }

    
    );
}

// Data Access - Creating the BCP List Item
function createBCPListItem() {
    var siteTitle = $("#txt_BCPName").val();
    var siteDesc = $("#txt_BCPDescription").val();
    var siteUrl = siteTitle.replace(/\s/g, "");

    var webUrl = _spPageContextInfo.webAbsoluteUrl;

$().SPServices({ 
    operation: "UpdateListItems",
    webURL: webUrl,
    async: false,
    batchCmd: "New",
    listName: BCPLISTNAME,
    valuepairs: [
        [ColumnBCPName, $("#txt_BCPName").val()],
        [ColumnCriticality, $("#sel_CriticalityName").val()],
        [ColumnDivision, $("#sel_DivisionName").val()],
        [ColumnUnit, $("#sel_UnitName").val()],
        [ColumnSection, $("#sel_SectionName").val()],
        [ColumnEntity, $("#sel_LegalEntity").val()],
        [ColumnLocation, $("#sel_Location").val()],
        [ColumnPurpose, $("#txt_BCPDescription").val()],
        [ColumnBCPLink, siteUrl]
    ],
    completefunc: function(xData, status) { 
        if (status == "success") {
            console.log("BCP Listitem successfully created");
            createBCPSubSite();
        }
        else {
            if (waitScreen != null) {
                waitScreen.close();
            }
            HandleBCPError("Error", "appl_createbcp.js - createBCPListItem", xData.responseText);
        }
    }
});
} 

// creating a BCP SubSite
function createBCPSubSite() {

    var webUrl = _spPageContextInfo.webAbsoluteUrl;

    var siteTitle = $("#txt_BCPName").val();
    var siteDesc = $("#txt_BCPDescription").val();
    var siteUrl = siteTitle.replace(/\s/g, "");
    newSiteUrl = webUrl + "/" + siteUrl;
    //var clientContext = new SP.ClientContext.get_current();
    var clientContext = new SP.ClientContext(webUrl);
    var collWeb = clientContext.get_web().get_webs();
    var webCreationInfo = new SP.WebCreationInformation();
    webCreationInfo.set_title(siteTitle);
    webCreationInfo.set_description(siteDesc);
    webCreationInfo.set_language(1033);
    webCreationInfo.set_url(siteUrl);
    webCreationInfo.set_useSamePermissionsAsParentSite(false);
    webCreationInfo.set_webTemplate(WebTemplateID);
    var oNewWebsite = collWeb.add(webCreationInfo);
    clientContext.executeQueryAsync(
        function (sender, args) {
            console.log("BCP Subsite successfully created");
 
            // pupulate subsite parameters in the subsite
            createCustomGroups(newSiteUrl);
        },
        function (sender, args) {
            if (waitScreen != null) {
                waitScreen.close();
            }
            HandleBCPError(args.get_message(), "appl_createbcp.js - createBCPSubSite", args.get_stackTrace(), "withPopUp");
        }
    );
}

// DataLogic - creating custom groups for the application 
function createCustomGroups(webURl) {

    var clientContext = new SP.ClientContext(webURl);
    var webToModify =  clientContext.get_web();
 
    //Get all groups in site
    var groupCollection = webToModify.get_siteGroups();
    
    // setting values and default values
    var ownerGroupName = $("#txt_BCPOwner").val();
    var membersGroupName = $("#txt_BCPMembers").val();
    var visitorsGroupName = $("#txt_BCPVisitors").val();

    if (isEmpty(ownerGroupName)) {
        ownerGroupName = "BCPOwner_" + $("#txt_BCPName").val();;
    }
    if (isEmpty(membersGroupName)) {
        membersGroupName = "BCPMember_" + $("#txt_BCPName").val();;
    }
    if (isEmpty(visitorsGroupName)) {
        visitorsGroupName = "BCPVisitor_" + $("#txt_BCPName").val();;
    }

    // Create Group information for Group
    var ownersGRP = new SP.GroupCreationInformation();
    var membersGRP = new SP.GroupCreationInformation();
    var visitorsGRP = new SP.GroupCreationInformation();

    ownersGRP.set_title(ownerGroupName);
    membersGRP.set_title(membersGroupName);
    visitorsGRP.set_title(visitorsGroupName);

    ownersGRP.set_description('Owners Group');
    membersGRP.set_description('Members Group');
    visitorsGRP.set_description('Visitors Group');

    //add group
    var oOwnersGRP = webToModify.get_siteGroups().add(ownersGRP);
    var oMembersGRP = webToModify.get_siteGroups().add(membersGRP);
    var oVisitorsGRP = webToModify.get_siteGroups().add(visitorsGRP);
 
    //Get Role Definition by name (http://msdn.microsoft.com/en-us/library/jj246687.aspx)
    //return SP.RoleDefinition object

    var rdFullControl = webToModify.get_roleDefinitions().getByName('Full Control');
    var rdContribute = webToModify.get_roleDefinitions().getByName('Contribute');
    var rdRead = webToModify.get_roleDefinitions().getByName('Read');
  
    // Create a new RoleDefinitionBindingCollection.
    var collFullControl = SP.RoleDefinitionBindingCollection.newObject(clientContext);
    var collContribute = SP.RoleDefinitionBindingCollection.newObject(clientContext);
    var collVisitors = SP.RoleDefinitionBindingCollection.newObject(clientContext);
      
    // Add the role to the collection.
    collFullControl.add(rdFullControl);
    collContribute.add(rdContribute);
    collVisitors.add(rdRead);
  
    // Get the RoleAssignmentCollection for the target web.
    var assignments = webToModify.get_roleAssignments();
      
    // assign the group to the new RoleDefinitionBindingCollection.
    var roleAssignmentContribute = assignments.add(oMembersGRP, collContribute);
    var roleAssignmentContribute = assignments.add(oOwnersGRP, collFullControl);
    var roleAssignmentContribute = assignments.add(oVisitorsGRP, collVisitors);

    clientContext.load(oOwnersGRP);
    clientContext.load(oMembersGRP);
    clientContext.load(oVisitorsGRP);

    //Execute Query
    clientContext.executeQueryAsync(
        function (sender, args) {
            console.log("Custom groups have been initialised");
            updateBCPListContent(newSiteUrl);
            // pupulate subsite parameters in the subsite
        },
        function (sender, args) {
            if (waitScreen != null) {
                waitScreen.close();
            }

            HandleBCPError(args.get_message(), "appl_createbcp.js - createCustomGroups", args.get_stackTrace());
        }
   );
}

// Update parameters of the newly created subsite
function updateBCPListContent(webURL) {
    var updateString = "<Batch OnError='Continue'>";
    updateString += "<Method ID='1' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>DivisionName</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" + normStr($("#sel_DivisionName").val()) + "</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='2' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>AreaName</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" +""+"</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='3' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>DepartmentName</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" +""+"</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='4' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>SectionName</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" + normStr($("#sel_SectionName").val()) + "</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='5' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>UnitName</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" + normStr($("#sel_UnitName").val()) + "</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='6' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>LegalEntity</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" + normStr($("#sel_LegalEntity").val()) + "</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='7' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>Locations</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" + normStr($("#sel_Location").val()) + "</Field>";
    updateString += "</Method>";
    updateString += "<Method ID='8' Cmd='New'>";
    updateString += "<Field Name='" + ColumnParameterName + "'>Purpose</Field>";
    updateString += "<Field Name='" + ColumnParameterValue + "'>" + normStr($("#txt_BCPDescription").val()) + "</Field>";
    updateString += "</Method>";
    updateString += "</Batch>";

    $().SPServices(
    {
        operation: "UpdateListItems",
        webURL: webURL,
        async: false,
        batchCmd: "New",
        listName: ParameterListName,
        updates: updateString,
        completefunc: function (xData, Status) {
            if (xData.status == 200) {
                if (waitScreen != null) {
                    waitScreen.close();
                }

                alert('BCP Creation succeeded.');
            }
            else {
                if (waitScreen != null) {
                    waitScreen.close();
                }
                HandleBCPError("Error", "appl_createbcp.js - updateBCPListContent", xData.responseText);
            }
        }
    });
}


// error and success functions - TODO common error handling functionality

function onQuerySucceeded(sender, args) {
    alert("BCP Area has been created!");
}

function onQueryFailed(sender, args) {
    alert('Request failed create. ' + args.get_message() +
        '\n' + args.get_stackTrace());
}

function WaitDialog() {
    waitScreen = SP.UI.ModalDialog.showWaitScreenWithNoClose("Please wait...", "Please wait...", 100, 300);
}