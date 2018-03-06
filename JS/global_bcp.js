// Parameters  - BCP List column names
var BCPLISTNAME = "BCPList";
var ColumnBCPName = "Title";
var ColumnCriticality = "Criticality";
var ColumnLocation = "Location";
var ColumnEntity = "Entity";
var ColumnRelevanceToAnEntity = "RelevanceToAnEntity";
var ColumnDivision = "Division";
var ColumnRecoveryStrategy = "RecoveryStrategy";
var ColumnWorkflowStatus = "WorkflowStatus";
var ColumnReviewDate = "ReviewDate";
var ColumnPurpose = "Purpose";
var ColumnUnit = "Unit";
var ColumnSection = "Section";

// metadata on the sub-level, they are not required for the first run
var ColumnBCPVersion = "BCPVersion";
var ColumnNextReviewDate = "NextReviewDate";
var ColumnBCPCoordinator = "BCPCoordinator";
var ColumnBCPCoordinatorDeputy = "BCPCoordinatorDeputy";
var ColumnFirstApprover = "FirstApprover";
var ColumnFirstApproverDeputy = "FirstApproverDeputy";
var ColumnSecondApprover = "SecondApprover";
var ColumnSecondApproverDeputy = "SecondApproverDeputy";
var ColumnFinalApproval = "FinalApproval";
var ColumnFinalApprovalDeputy = "FinalApprovalDeputy";
var ColumnBCPLink = "BCPLink";

var UNITLISTNAME = "BCP Unit";
var ColumnUnitNameEN = "Title";

var SESSIONLISTNAME = "BCP Section";
var ColumnSessionNameEN = "Title";

var DIVISIONLISTNAME = "BCP Division";
var ColumnDivisionEN = "Title";

var ENTITYLISTNAME = "BCP Entity";
var ColumnEntityEN = "Title";

var LOCATIONLISTNAME = "BCP Location";
var ColumnLocationEN = "Title";

var ENTITYRELEVANCELISTNAME = "BCP RelevanceOfEntity";
var ColumnTitle = "Title";


var RECOVERYSTRATEGYLISTNAME = "BCP RecoveryStrategy";
var ColumnRecoveryEN = "RecoveryEN";

var ParameterListName = "ParameterList";
var ColumnParameterName = "Title";
var ColumnParameterValue = "ParameterValue";
var ColumnParameterType = "ParameterType";

// forms
var NewFormBCPLInk = "../SitePages/CreateBCPWP.aspx";
var ViewFormBCPLInk = "/sites/test/SitePages/ViewBCP.aspx";
var EditFormBCPLInk = "sites/test/Lists/BCPList/EditForm.aspx";

// parameters -  messages
var ErrorLogListName = "ErrorLog";
var ColumnErrorTitle = "ErrorMessage";
var ColumnErrorMessage = "ErrorMessage";
var ColumnErrorSource = "ErrorSource";
var ColumnErrorTime = "ErrorTime";
var ColumnErrorDetails = "ErrorDetails";

// Dialog Messages
var ErrorMessageText = "An unexpected error happened, please contact your system administrator!";

// Template site name to deliver
var SiteTemplateName = "BCP";

// localURL and webtemplate ID ----- to modify  !!!!
//var TopSiteURL = "http://";
//var WebTemplateID = "{98E2756D-9865-4B1B-B122-BB6E051477B6}#BCPTemplate";


// Services
// Open SharePoint Link in Modal Dialog
function openDialog(_pageUrl, _width, _height, _title) {
    SP.UI.ModalDialog.showModalDialog(
      {
          url: _pageUrl,
          width: _width,
          height: _height,
          title: _title
      }
   );
}


// Help functions: deleting lookup stuffs
function normStr(input) {
    if (input == null)
        return input;

    if (input.indexOf(";#") > -1) {
        return input.substring(input.indexOf(";#") + 2);
    }
    else {
        return input;
    }
}

// helo function checking if string is empty
function isEmpty(str) {
    return (!str || 0 === str.length);
}

// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

//error functions 
function LogBCPError(_message, _source, _details)
{
    //var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var webUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;

    $().SPServices({
        operation: "UpdateListItems",
        webURL: webUrl,
        async: false,
        batchCmd: "New",
        listName: ErrorLogListName,
        valuepairs: [
            [ColumnErrorTitle, escape(_message)],
            [ColumnErrorMessage, escape(_message)],
            [ColumnErrorSource,  _source],
            [ColumnErrorTime, new Date().toLocaleString()],
            [ColumnErrorDetails, escape(_details)]
        ],
        completefunc: function (xData, status) {

            if (status == "success") {
                //alert("Thank you, " + $("#txt_BCPName").val() + ", has been sucessfully created!");
            }
            else {
                alert("Problem at the logging functionality" + xData.responseText);
            }
        }
    });
}

// error handling and showing functions

function ShowErrorMessage(_message)
{
    var ErrorToShow = _message + " - " + ErrorMessageText;
    alert(ErrorToShow);
}

function HandleBCPError(_message, _source, _details, _severity) {
    console.log(_message + _source + _details);
    LogBCPError(_message, _source, _details);
    if (_severity != null)
    {
        ShowErrorMessage(_message);
    }
}

