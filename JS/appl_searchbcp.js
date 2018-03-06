// Messages and texts
var NewFormBCPTitle = "Create New Business Continuity Plan";

// initialising
$(document).ready(function () {
  //  SP.SOD.executeOrDelayUntilScriptLoaded(readBCPListItems, "jquery.SPServices-2014.02.min.js");
    readBCPListItems();
});



// data services
function readBCPListItems() {
  //  try {

        var webUrl = _spPageContextInfo.webAbsoluteUrl;
        var CAMLQuery = "<ViewFields>";
        CAMLQuery += "<FieldRef Name='" + ColumnBCPName + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnCriticality + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnLocation + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnEntity + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnRelevanceToAnEntity + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnDivision + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnRecoveryStrategy + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnWorkflowStatus + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnReviewDate + "' />";
        CAMLQuery += "<FieldRef Name='" + ColumnBCPLink + "' />";
        CAMLQuery += "</ViewFields>";

        $().SPServices({
            operation: "GetListItems",
            webURL: webUrl,
            async: false,
            listName: BCPLISTNAME,
            CAMLViewFields: CAMLQuery,
            completefunc: function (xData, Status) {
                if (Status == "success") {

                    dataSet = new Array();
                    $(xData.responseXML).SPFilterNode("z:row").each(function () {

                        var liHtml = "<tr>";

                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnBCPName)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnCriticality)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnLocation)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnEntity)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnRelevanceToAnEntity)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnDivision)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnRecoveryStrategy)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnWorkflowStatus)) + "</td>";
                        liHtml += "<td>" + normStr($(this).attr("ows_" + ColumnReviewDate)) + "</td>";
                        var LinkValue = $(this).attr("ows_" + ColumnBCPLink);
                        var itemID = $(this).attr("ows_ID");
                        //liHtml += "<td><a href=" + ViewFormBCPLInk + "?BPCID=" + itemID + " >Go to PCB Cover Page</a></td>";
                        liHtml += "<td><a href=" + webUrl + "/" + LinkValue + ">Go to PCB Cover Page</a></td>";

                        //webUrl
                        //liHtml += "<td><a href=" + EditFormBCPLInk + "?ID=" + itemID + " >Edit PCB</a></td>";

                        liHtml += "</tr>";

                        $("#dataTableBCPBody").append(liHtml);

                    });

                    bindDataTable();
                }
                else {
                    HandleBCPError("Error", "appl_searchbcp.js - readBCPListItems", xData.responseText);
                }
            }
        });
  //  } catch (err)
  //  {
  //      LogBCPError(err.message, "readBCPListItems", err.stack);
  //      ShowErrorMessage();
  //  }
}

// binding controls
function bindDataTable() {
    try {

        $('#dataTableBCP').DataTable({
            colReorder: true,
            ordering: true,
            responsive: true,
            dom: "Bfrtip",
            buttons: ['copy', 'csv', 'excel', 'pdf', 'print',
                {
                    text: 'Create',
                    action: function (e, dt, node, config) {
                        openDialog(NewFormBCPLInk, 600, 600, NewFormBCPTitle);
                    }
                }
            ]
            ,
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.header()).append("<div>"))
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );

                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();

                        }).append("</div");

                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                });
            }
        }
        );
    }
    catch (err)
    {
        HandleBCPError(err.name, "appl_searchbcp.js - bindDataTable", err.message);
    }
}

