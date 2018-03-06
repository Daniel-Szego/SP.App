// Messages and texts


// initialising
$(document).ready(function () {
    //  SP.SOD.executeOrDelayUntilScriptLoaded(readBCPListItems, "jquery.SPServices-2014.02.min.js");
    readBCPListItem();

});

// data services
function readBCPListItem() {
    //  try {

    var webUrl = _spPageContextInfo.webAbsoluteUrl;
    var CAMLQuery = "<ViewFields>"
    CAMLQuery += "<FieldRef Name='" + ColumnParameterName + "' />";
    CAMLQuery += "<FieldRef Name='" + ColumnParameterValue + "' />";
    CAMLQuery += "<FieldRef Name='" + ColumnParameterType + "' />";
    CAMLQuery += "</ViewFields>";

    $().SPServices({
        operation: "GetListItems",
        webURL: webUrl,
        async: false,
        listName: ParameterListName,
        CAMLViewFields: CAMLQuery,
        completefunc: function (xData, Status) {
            if (Status == "success") {


                dataSet = new Array();

                $(xData.responseXML).SPFilterNode("z:row").each(function () {
                    var ParameterName = $(this).attr("ows_" + ColumnParameterName);
                    var ParameterValue = $(this).attr("ows_" + ColumnParameterValue);
                    if (ParameterName == "DivisionName") {
                        $("#lblDivisonBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "AreaName") {
                        $("#lblAreaNameBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "DepartmentName") {
                        $("#lblDepartmentNameBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "SectionName") {
                        $("#lblsectionNameBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "UnitName") {
                        $("#lblUnitNameBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "LegalEntity") {
                        $("#lblLegalEntityBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "Locations") {
                        $("#lblLocationBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "Purpose") {
                        $("#lblPurposeBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "BCPVersion") {
                        $("#lblBCPVersionBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "BCPWorkflowStatus") {
                        $("#lblBCPWorkflowVersionBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "BCPPublishedDate") {
                        $("#lblBCPPublishedDateNameBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "NextReviewDate") {
                        $("#lblNewReviewDateBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "BCPCoordinator") {
                        $("#lblBCPCoordinatorCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "BCPCoordinatorDeputy") {
                        $("#lblBCPCoordinatorDeputyBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "FirstApprover") {
                        $("#lblFirstApproverPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "FirstApproverDeputy") {
                        $("#lblFirstApproverDeputyBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "SecondApprover") {
                        $("#lblSecondApproverBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "SecondApproverDeputy") {
                        $("#lblSecondApproverDeputyBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "FinalApprover") {
                        $("#lblFinalApproverBPCCoverPage").text(ParameterValue);
                    }
                    else if (ParameterName == "FinalApproverDeputy") {
                        $("#lblFinalApproverDeputyBPCCoverPage").text(ParameterValue);
                    }
                });
            }
            else {
                HandleBCPError("Error", "appl_viewbcp.js - readBCPListItem", xData.responseText);
            }
        }
    });
}


