//List Names
var LIST_WORKSPACE = "Workspace Unavailability";

//Tab Default
var DEFAULT_ALL_TAB = "All tasks";

//Labels
var LABEL_MOREOPTION = "More Options";
var LABEL_LESSOPTION = "Less Options";
var LABEL_EDITFORM = "Edit Form";
var LABEL_NEWFORM = "New Form";
var LABEL_HIDECOLUMNS = "Hidden Columns";
var LABEL_NO_ITEMS_FOUND = " didn't match any item"; // Search text + this text
var LABEL_YES = "Yes";
var LABEL_NO = "No";

//Table Headings
var TABLE_HEADER_TASKTYPE = "Task Type"
var TABLE_HEADER_TOTAL = "Total Tasks";
var TABLE_HEADER_ADDITIONAL_INFO = "Additional Information";
var TABLE_HEADER_TASKNAME = "Task Name";
var TABLE_HEADER_RECOVERY = "Recovery Strategy";
var TABLE_HEADER_DESCRIPTION = "Describe Recovery Strategy";
var TABLE_HEADER_S2H = "<=2 h";
var TABLE_HEADER_S24H = "<=24 h";
var TABLE_HEADER_S3D = "<=3 day";
var TABLE_HEADER_S1W = "<=1 week";
var TABLE_HEADER_S1M = "1 month";
var TABLE_HEADER_TOTAL_STAFFS = "Total Staffs";
var TABLE_HEADER_NUMBER_OF_STAFFS = "Number of staff required (including shifts)";

//Buttons
var BUTTON_EDIT = "Edit";
var BUTTON_SAVE = "Save";
var BUTTON_ADDNEWTASK = "Add New Task";
var BUTTON_SHOWNEWCOLUMNS = "Show/Hide Columns";
var BUTTON_RESET = "RESET";

//Error Messages
var ERROR_HIDECOLUMN = "Hide column update failed.\n";
var ERROR_UNEXPECTED = "An unexpected error has occured. \n";
var ERROR_UNEXPECTED_LIST = "An unexpected error has occured while retreiving data from \"{0}\" List. \n"
var ERROR_USERPERMISSIONCHECK = "User Permission check has failed.\n";
var ERROR_GENERATE_SEARCH_TABLE = "Search failed.\n";


//Properties
var PROP_DISPLAYCOLUMNS = "DISPLAY_COLUMNS";

var HiddenColumnItems = [
               [TABLE_HEADER_RECOVERY, "RecoveryStrategy"],
               [TABLE_HEADER_DESCRIPTION, "Description"],
               [TABLE_HEADER_S2H, "S2H"],
               [TABLE_HEADER_S24H, "S24H"],
               [TABLE_HEADER_S3D, "S3D"],
               [TABLE_HEADER_S1W, "S1W"],
               [TABLE_HEADER_S1M, "S1M"],
               [TABLE_HEADER_TOTAL_STAFFS, "Total"]
];

var SITE_URL = _spPageContextInfo.webAbsoluteUrl;

//Global variables  
var erroroccurred = false;
var FormView = "ALL";

$(document).ready(function () {
    var rstrategy = getQueryStringParameter("rstrategy");
    if (typeof rstrategy !== 'undefined') $('#hdnrstrategy').val(decodeURIComponent(rstrategy));
    $('#firstcolumn').attr('title', TABLE_HEADER_ADDITIONAL_INFO);
    $('#secondcolumn').html(TABLE_HEADER_TASKTYPE);
    $('#thirdcolumn').html(TABLE_HEADER_TASKNAME);
    $('#fourthcolumn').html(TABLE_HEADER_RECOVERY);
    $('#fifthcolumn').html(TABLE_HEADER_DESCRIPTION);
    $('#sixthcolumn').html(TABLE_HEADER_NUMBER_OF_STAFFS);
    $('#seventhcolumn').html(BUTTON_EDIT);
    $('#eighthcolumn').html(TABLE_HEADER_S2H);
    $('#ninthcolumn').html(TABLE_HEADER_S24H);
    $('#tenthcolumn').html(TABLE_HEADER_S3D);
    $('#eleventhcolumn').html(TABLE_HEADER_S1W);
    $('#twelthcolumn').html(TABLE_HEADER_S1M);
    $('#thirteenthcolumn').html(TABLE_HEADER_TOTAL_STAFFS);
    $('#aALL').html(DEFAULT_ALL_TAB);
    $('#loading').css('display', 'block');
    ExecuteOrDelayUntilScriptLoaded(function () { LoadDropdowns(); CheckUserPermission(); }, "sp.js");
});

$(function () {
    $("#tabs").tabs();
    $('#loading').css('display', 'block');
    $.widget("custom.combobox", {
        _create: function () {
            this.wrapper = $("<span>")
              .addClass("custom-combobox")
              .insertAfter(this.element);

            this.element.hide();
            this._createAutocomplete();
            this._createShowAllButton();
        },

        _createAutocomplete: function () {
            var selected = this.element.children(":selected"),
              value = selected.val() ? selected.text() : "";

            this.input = $("<input>")
              .appendTo(this.wrapper)
              .val(value)
              .attr("title", "")
              .attr("id", this.element[0].id.replace('drp', 'txt'))
              .addClass("custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left")
              .autocomplete({
                  delay: 0,
                  minLength: 0,
                  source: $.proxy(this, "_source")
              })
              .tooltip({
                  classes: {
                      "ui-tooltip": "ui-state-highlight"
                  }
              });

            this._on(this.input, {
                autocompleteselect: function (event, ui) {
                    ui.item.option.selected = true;
                    this._trigger("select", event, {
                        item: ui.item.option
                    });
                },

                autocompletechange: "_removeIfInvalid"
            });
        },

        _createShowAllButton: function () {
            var input = this.input,
              wasOpen = false;

            $("<a>")
              .attr("tabIndex", -1)
              .attr("title", "Show All Items")
              .tooltip()
              .appendTo(this.wrapper)
              .button({
                  icons: {
                      primary: "ui-icon-triangle-1-s"
                  },
                  text: false
              })
              .removeClass("ui-corner-all")
              .addClass("custom-combobox-toggle ui-corner-right")
              .on("mousedown", function () {
                  wasOpen = input.autocomplete("widget").is(":visible");
              })
              .on("click", function () {
                  input.trigger("focus");

                  // Close if already visible
                  if (wasOpen) {
                      return;
                  }

                  // Pass empty string as value to search for, displaying all results
                  input.autocomplete("search", "");
              });
        },

        _source: function (request, response) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            //if(request.term == "" && $('#' + this.element[0].id.replace('drp', 'txt')).val() != ""){DrawTable(this.element[0].id.replace('drp', 'txt'), request.term)}
            response(this.element.children("option").map(function () {
                var text = $(this).text();
                if (this.value && (!request.term || matcher.test(text)))
                    return {
                        label: text,
                        value: text,
                        option: this
                    };
            }));
        },

        _removeIfInvalid: function (event, ui) {

            if (ui.item) {
                return;
            }

            // Search for a match (case-insensitive)
            var value = this.input.val(),
              valueLowerCase = value.toLowerCase(),
              valid = false;
            this.element.children("option").each(function () {
                if ($(this).text().toLowerCase() === valueLowerCase) {
                    this.selected = valid = true;
                    return false;
                }
            });

            // Found a match, nothing to do
            if (valid) {
                return;
            }

            // Remove invalid value
            var displaytxt = value + LABEL_NO_ITEMS_FOUND;
            if (value == "") displaytxt = "";
            this.input
                 .val("")
                 .attr("title", displaytxt)
                 .tooltip("open");
            this.element.val("");
            this._delay(function () {
                this.input.tooltip("close").attr("title", "");
            }, 2500);
            this.input.autocomplete("instance").term = "";
            DrawTable(this.element[0].id, value);
        },
        _destroy: function () {
            this.wrapper.remove();
            this.element.show();
        }
    });

    $("#drpRstrategy").combobox({
        select: function (event, ui) {
            DrawTable("Rstrategy", ui.item.value);
        }
    })

    $('#txtRstrategy').change(function () {
        var val = $(this).val();
        if (val == "") DrawTable("Rstrategy", $(this).val());
    });

});

function DrawTable(id, val) {
    var oTable = $('#tblWorkspace').DataTable();
    var oSettings = oTable.settings();
    var rsval = $('#txtRstrategy').val();
    if (id == "Rstrategy") rsval = val;
    oSettings[0].aoPreSearchCols[2].sSearch = rsval;
    oTable.draw();
}

function LoadDropdowns() {
    var ListURL = SITE_URL + "/_api/web/lists/getbytitle('" + LIST_WORKSPACE + "')/fields?$filter=EntityPropertyName eq 'Recovery_Strategy'";
    GenerateDropdowns(ListURL, "#drpRstrategy", LIST_WORKSPACE, '#hdnrstrategy', true);
}

function GenerateDropdowns(ListURL, DrpID, ListName, hdncolumn, choice) {
    $.ajax({
        url: ListURL,
        type: "GET",
        dataType: "json",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (data) {
            var lkpvalues = "";
            if (choice) {
                $.each(data.d.results[0].Choices.results, function (index, item) {
                    $(DrpID).append("<option>" + item + "</option>");
                    lkpvalues = lkpvalues + item + ",";
                });
            }
            else {
                $.each(data.d.results, function (index, item) {
                    $(DrpID).append("<option>" + item.Title + "</option>");
                    lkpvalues = lkpvalues + item.Title + ",";
                });
            }
            $(hdncolumn).val(lkpvalues);
        },
        error: function (xhr, status, error) {
            if (!erroroccurred)
                alert(ERROR_UNEXPECTED_LIST.replace('{0}', ListName) + JSON.stringify(error));
            erroroccurred = true;
        }
    });
}

function GetDistinctdata(items, propertyName) {
    var result = [];
    $.each(items, function (index, item) {
        if ($.inArray(item[propertyName], result) == -1) {
            result.push(item[propertyName]);
        }
    });
    result.sort();
    return result;
}

function LoadWorkSpaceTable(SelectedView) {
    var oDataUrl = SITE_URL + "/_api/web/lists/getbytitle('" + LIST_WORKSPACE + "')/items?$select=ID, Title, Task_Type, Recovery_Strategy, Description,Attachments,AttachmentFiles,S_2h,S_24h,S_3d,S_1w,S_1m,Total"
        + "&$expand=AttachmentFiles&$orderby=Title asc&$top=9999";
    FormView = SelectedView;
    $.ajax({
        url: oDataUrl,
        type: "GET",
        dataType: "json",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (wsdata) {
            var columns = $("#hdncolumns").val();
            var width = 30;
            var rstatview = true;
            var descriptionview = true;
            var s2hview = true;
            var s24hview = true;
            var s3dview = true;
            var s1wview = true;
            var s1mview = true;
            var totalview = true;
            var tabnew = false;
            if (columns.indexOf("RecoveryStrategy") !== -1) { rstatview = false; } else width = width + 20;
            if (columns.indexOf("Description") !== -1) { descriptionview = false; } else width = width + 20;
            if (columns.indexOf("S2H") !== -1) { s2hview = false; } else width = width + 5;
            if (columns.indexOf("S24H") !== -1) { s24hview = false; } else width = width + 5;
            if (columns.indexOf("S3D") !== -1) { s3dview = false; } else width = width + 5;
            if (columns.indexOf("S1W") !== -1) { s1wview = false; } else width = width + 5;
            if (columns.indexOf("S1M") !== -1) { s1mview = false; } else width = width + 5;
            if (columns.indexOf("Total") !== -1) { totalview = false; } else width = width + 5;
            var EditView = ($('#hdnUserPermission').val() == "YES" ? true : false);
            var TaskTypes = GetDistinctdata(wsdata.d.results, 'Task_Type');
            $.each(TaskTypes, function (tasktypeindex, tasktypeitem) {
                var ReturnedTask = $.grep(wsdata.d.results, function (element, index) {
                    return element.Task_Type == tasktypeitem;
                });
                tasktypeitem = tasktypeitem.split(' ')[0];
                if ($('#a' + tasktypeitem).length == 0) {
                    $("#tabul").append('<li><a id="a' + tasktypeitem + '" href="#tabs-1" onclick="LoadWorkSpaceTable(\'' + tasktypeitem + '\');">' + tasktypeitem + ' <span id="spn' + tasktypeitem + '" style="color:red;font-weight:bold">(' + ReturnedTask.length.toString() + ')</span></a></li>');
                    tabnew = true;
                }
                else {
                    $('#spn' + tasktypeitem).html("(" + ReturnedTask.length.toString() + ")");
                }
            });
            try {
                var WorkspaceDatatable = $('#tblWorkspace').DataTable();
                if (WorkspaceDatatable != 'undefined') {
                    WorkspaceDatatable.destroy();
                }
                var QSfilter = false;
                WorkspaceDatatable = $('#tblWorkspace').DataTable({
                    data: wsdata.d.results,
                    "language": {
                        "infoEmpty": "No records available",
                    },
                    columns:
                     [{
                         "mData": "Attachments",
                         "render": function (data, type, row) {
                             if (row.Attachments)
                                 return "<span><a href='" + row.AttachmentFiles.results[0].ServerRelativeUrl + "' target='_blank'><img width='16' height='16' src='/_layouts/15/images/attach16.png?rev=23' border='0' title='" + row.AttachmentFiles.results[0].FileName + "'></a></span>";
                             else
                                 return "";
                         },
                         "width": "2%",
                         "bSearchable": false
                     },
                     {
                         "mData": "Task_Type",
                         "render": function (data, type, row) {
                             return "<span>" + row.Task_Type + "</span>";
                         },
                         "width": "14%"
                     },
                     {
                         "mData": "Title",
                         "render": function (data, type, row) {
                             return "<span>" + row.Title + "</span>";
                         },
                         "width": "14%"
                     },
                    {
                        "mData": "Recovery_Strategy",
                        "render": function (data, type, row) {
                            return "<span>" + (row.Recovery_Strategy.results.length > 0 ? row.Recovery_Strategy.results.join(", ") : "") + "</span>";
                        },
                        "visible": rstatview,
                        "width": "20%"
                    },
                    {
                        "mData": "Description",
                        "visible": descriptionview,
                        "render": function (data, type, row) {
                            return "<span>" + (row.Description != null ? row.Description : "") + "</span>";
                        },
                        "width": "20%"
                    },
                    {
                        "mData": "S_2h",
                        "visible": s2hview,
                        "className": 'tdcenteralign',
                        "render": function (data, type, row) {
                            return "<span>" + row.S_2h + "</span>";
                        },
                        "width": "5%"
                    },
                    {
                        "mData": "S_24h",
                        "visible": s24hview,
                        "className": 'tdcenteralign',
                        "render": function (data, type, row) {
                            return "<span>" + row.S_24h + "</span>";
                        },
                        "width": "5%"
                    },
                    {
                        "mData": "S_3d",
                        "visible": s3dview,
                        "className": 'tdcenteralign',
                        "render": function (data, type, row) {
                            return "<span>" + row.S_3d + "</span>";
                        },
                        "width": "5%"
                    },
                    {
                        "mData": "S_1w",
                        "visible": s1wview,
                        "className": 'tdcenteralign',
                        "render": function (data, type, row) {
                            return "<span>" + row.S_1w + "</span>"
                        },
                        "width": "5%"
                    },
                    {
                        "mData": "S_1m",
                        "visible": s1mview,
                        "className": 'tdcenteralign',
                        "render": function (data, type, row) {
                            return "<span>" + row.S_1m + "</span>";
                        },
                        "width": "5%"
                    },
                    {
                        "mData": "Total",
                        "visible": totalview,
                        "className": 'tdcenteralign',
                        "render": function (data, type, row) {
                            return "<span>" + Math.round(row.Total).toString() + "</span>";
                        },
                        "width": "5%"
                    },
                    {
                        "mData": "ID",
                        "visible": EditView,
                        "render": function (data, type, row) {
                            return "<button class='btnStyle' style='min-width:30px' onclick='return ShowEditForm(" + row.ID + ");'>" + BUTTON_EDIT + "</button>";
                        },
                        "width": "5%"
                    }
                     ],
                    "autoWidth": false,
                    order: [[1, 'asc']],
                });
                if ($('#hdnUserPermission').val() == "YES") {
                    $('div.dataTables_length').after('<div  align="left" style="float:right;padding-right:2px"><button class="btnStyle" onclick="return ShowNewForm();"  style="padding-right:5px;">' + BUTTON_ADDNEWTASK + '</button></div>');
                    $('div.dataTables_length').after('<div  align="left" style="float:right;padding-right:5px"><button class="btnStyle" onclick="return ShowHideColumns();" style="padding-right:5px;">' + BUTTON_SHOWNEWCOLUMNS + '</button></div>');
                }
                if (FormView != "ALL") {
                    var oSettings = WorkspaceDatatable.settings();
                    oSettings[0].aoPreSearchCols[1].sSearch = FormView;
                    WorkspaceDatatable.draw();
                }
                if (tabnew) { $("#tabs").tabs("destroy"); $("#tabs").tabs(); }
                $('#loading').css('display', 'none');
                $("#tabs").css('display', 'block');
            }
            catch (e) {
                $('#loading').css('display', 'none');
                alert(ERROR_GENERATE_SEARCH_TABLE + e.message);
            }

        },
        error: function (xhr, status, error) {
            alert(ERROR_UNEXPECTED_LIST.replace('{0}', LIST_WORKSPACE) + JSON.stringify(error + xhr.responseText));
        }
    });

}

function DrawMultiFilterTable() {
    var oTable = $('#tblWorkspace').DataTable();
    var oSettings = oTable.settings();
    var rsval = $('#txtRstrategy').val();
    oSettings[0].aoPreSearchCols[5].sSearch = rsval;
    oTable.page(lastpage).draw(false);
}

function ShowEditForm(id) {
    var width = window.innerWidth / 2;
    var height = window.innerHeight / 1.2;
    var options = {
        title: LABEL_EDITFORM,
        width: width,
        height: height,
        url: "../Lists/" + LIST_WORKSPACE + "/EditForm.aspx?ID=" + id + "&Source=" + document.URL,
        dialogReturnValueCallback: function (result, target) { if (result == SP.UI.DialogResult.OK) { LoadWorkSpaceTable(FormView); } }
    };
    SP.UI.ModalDialog.showModalDialog(options);
    return false;
}

function ShowNewForm() {
    var width = window.innerWidth / 2;
    var height = window.innerHeight / 1.2;
    var options = {
        title: LABEL_NEWFORM,
        width: width,
        height: height,
        url: "../Lists/" + LIST_WORKSPACE + "/NewForm.aspx",
        dialogReturnValueCallback: function (result, target) { if (result == SP.UI.DialogResult.OK) { LoadWorkSpaceTable(FormView); } }
    };
    SP.UI.ModalDialog.showModalDialog(options);
    return false;
}

function ShowHideDiv() {
    var text = $("#aMoreoption").text();
    if (text == LABEL_MOREOPTION) {
        $("#aMoreoption").text(LABEL_LESSOPTION);
        $("#divSearch").css('display', 'block');
    }
    else {
        $("#aMoreoption").text(LABEL_MOREOPTION);
        $("#divSearch").css('display', 'none');
    }
}

function FormatDate(dateObject) {
    var d = new Date(dateObject);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = day + "/" + month + "/" + year;
    return date;
};

function getQueryStringParameter(paramToRetrieve) {
    var url = document.URL;
    var urlpart = url.substring(url.indexOf('?') + 1);
    var params = urlpart.split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0].toLowerCase() == paramToRetrieve.toLowerCase()) return singleParam[1];
    }
}

function CheckUserPermission() {
    var context = new SP.ClientContext.get_current();
    var web = context.get_web();
    this._currentUser = web.get_currentUser();
    var oList = context.get_web().get_lists().getByTitle(LIST_WORKSPACE);
    var properties = web.get_allProperties();
    context.load(this._currentUser);
    context.load(oList, 'EffectiveBasePermissions');
    context.load(properties);
    context.executeQueryAsync(function () {
        var currentprop = null;
        try {
            currentprop = properties.get_item(_spPageContextInfo.pageItemId + PROP_DISPLAYCOLUMNS);
        }
        catch (err) {

        }
        if (currentprop != null)
            $("#hdncolumns").val(currentprop);
        if (oList.get_effectiveBasePermissions().has(SP.PermissionKind.editListItems)) {
            $("#hdnUserPermission").val("YES");
        }
        else
            $("#hdnUserPermission").val("NO");
        LoadWorkSpaceTable(FormView);
    },
    function (sender, args) {
        //failed.
        if (!erroroccurred)
            alert(ERROR_USERPERMISSIONCHECK + args.get_message());
    });
}

function ShowHideColumns() {
    var columns = $("#hdncolumns").val();
    var checked = "";
    var columnhtml = "<table class='ms-table'>";
    for (var i = 0; i < HiddenColumnItems.length; i = i + 1) {
        checked = "";
        if (columns.indexOf(HiddenColumnItems[i][1]) !== -1) checked = "checked";
        columnhtml = columnhtml + "<tr>";
        columnhtml = columnhtml + "<td   style='padding:8px;'> <input style='padding-right:5px' type='checkbox' id='chk" + HiddenColumnItems[i][1] + "' " + checked + "/> <span>" + HiddenColumnItems[i][0] + "</span> </td>"
        columnhtml = columnhtml + "</tr>";
    }
    columnhtml = columnhtml + "<tr><td  style='padding:8px;'><button type='button' id='btnSaveColumns' class='btnStyle' onclick='SaveColumns()'>" + BUTTON_SAVE + "</button></td></tr></table>";
    var divElem = document.createElement('div');
    divElem.innerHTML = columnhtml;
    var options = {
        title: LABEL_HIDECOLUMNS,
        width: 250,
        height: 350,
        html: divElem
    };
    SP.UI.ModalDialog.showModalDialog(options);
    return false;
}

function SaveColumns() {
    var columns = "";
    for (var i = 0; i < HiddenColumnItems.length; i = i + 1) {
        if (document.getElementById('chk' + HiddenColumnItems[i][1]).checked) {
            columns = columns + HiddenColumnItems[i][1] + ","
        }
    }
    SetWebProperties(_spPageContextInfo.pageItemId + PROP_DISPLAYCOLUMNS, columns);
}

function SetWebProperties(key, value) {
    var clientContext = new SP.ClientContext.get_current();
    var oweb = clientContext.get_web();
    var properties = oweb.get_allProperties();
    properties.set_item(key, value);
    clientContext.load(oweb);
    oweb.update();
    clientContext.executeQueryAsync(
        function () {
            $("#hdncolumns").val(value);
            LoadWorkSpaceTable(FormView);
            SP.UI.ModalDialog.commonModalDialogClose();
        },
        function (sender, args) {
            alert(ERROR_HIDECOLUMN + args.get_message());
        }
     );
}

function ResetFilter() {
    if ($('#txtRstrategy').val() == ""
        && $('#hdnrstrategy').val() == "" && $('#hdnSearchText').val() == "") {
        //do nothing
    }
    else {
        $('#txtRstrategy').val('');
        $('#hdnrstrategy').val('');
        $('#hdnSearchText').val('');
        $('#tblWorkspace').DataTable().search('').draw();
        DrawMultiFilterTable();
    }
}