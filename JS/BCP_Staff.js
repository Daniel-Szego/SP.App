//List Names
var LIST_WORKSPACE = "Staff Unavailability";

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


//Global variables
//Content Type ID
var LINK_TO_DOCUMENT = "0x01010A006D7DB09372B45E478D14D2AA12C72D32";

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
var tr_clicked = null;
var row_clicked = null;
var workspacedata = null;
var clickeditem = [];
var erroroccurred = false;
var initialload = true;
var childdatatablesid = [];
var lastsortcol = 1;
var lastsortorder = 'asc';
var lastdisplaylength = 10;
var lastpage = 0;
var alltablerows = [];


$(document).ready(function () {
    var rstrategy = getQueryStringParameter("rstrategy");
    if (typeof rstrategy !== 'undefined') $('#hdncompany').val(decodeURIComponent(rstrategy));
    $('#secondcolumn').html(TABLE_HEADER_TASKTYPE);
    $('#thirdcolumn').html(TABLE_HEADER_TOTAL);
    $('#loading').css('display', 'block');
    ExecuteOrDelayUntilScriptLoaded(function () { LoadDropdowns(); CheckUserPermission(); }, "sp.js");
    $('#imgheader').click(function () { OpenCloseallTr(); });

});
$(function () {
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
            DrawTable("Company", ui.item.value);
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
    oSettings[0].aoPreSearchCols[5].sSearch = rsval;
    oTable.draw();
    SearchChildTable(id, val);
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

function OpenCloseallTr() {
    var allshown = true;

    $('#tblWorkspace>tbody>tr.odd,#tblWorkspace>tbody>tr.even').each(function (index, elem) {
        var $elem = $(elem);
        if ($elem[0].className.indexOf('shown') == -1)
            allshown = false;
    });
    $.each(alltablerows, function (index, value) {
        var WorkspaceDatatable = $('#tblWorkspace').DataTable();
        tr_clicked = $('.parentrow' + value.toString());
        row_clicked = WorkspaceDatatable.row(tr_clicked);
        if (!allshown) {
            OpenCloseEvent(false, true);
        }
        else {
            OpenCloseEvent(false, false);
        }
    });
    SearchChildTable("", "");

}

function LoadWorkSpaceTable(internalload) {
    var oDataUrl = SITE_URL + "/_api/web/lists/getbytitle('" + LIST_WORKSPACE + "')/items?$select=ID, Title, Task_Type, Recovery_Strategy, Description,Attachments,AttachmentFiles,S_2h,S_24h,S_3d,S_1w,S_1m,Total"
        + "&$expand=AttachmentFiles&$orderby=Title asc&$top=9999";
    $.ajax({
        url: oDataUrl,
        type: "GET",
        dataType: "json",
        headers: {
            "accept": "application/json;odata=verbose"
        },
        success: function (wsdata) {
            if (wsdata.d.results.length > 0) {
                var TaskTypes = GetDistinctdata(wsdata.d.results, 'Task_Type');
                var resultdata = '{ "data" :[';
                var datatrow = "";
                var tasktitle = "";
                var alltaskname = "";
                var allrstrategy = [];
                var allDescription = "";
                $.each(TaskTypes, function (tasktypeindex, tasktypeitem) {
                    tasktitle = "";
                    url = "";
                    alltaskname = "";
                    allDescription = "";
                    allrstrategy = [];
                    if ($('#hdnUserPermission').val() == "YES")
                        datatrow = datatrow + "<th>" + BUTTON_EDIT + "</th>";
                    datatrow = datatrow + "</tr></thead><tbody>";
                    var ReturnedTask = $.grep(wsdata.d.results, function (element, index) {
                        return element.Task_Type == tasktypeitem;
                    });
                    resultdata = resultdata + "{";
                    var childdata = "{ &quot;data&quot; :[";
                    $.each(ReturnedTask, function (taskindex, taskitem) {
                        if (tasktitle == "")
                            tasktitle = tasktypeitem;
                        childdata = childdata + "{";
                        childdata = childdata + "&quot;ID&quot;:&quot;" + taskitem.ID + "&quot;,";
                        childdata = childdata + "&quot;TaskType&quot;:&quot;" + tasktitle + "&quot;,";
                        childdata = childdata + "&quot;TaskName&quot;:&quot;" + taskitem.Title + "&quot;,";
                        alltaskname = alltaskname + taskitem.Title;
                        var rstrat = "";
                        if (taskitem.Recovery_Strategy.results.length > 0)
                            rstrat = taskitem.Recovery_Strategy.results.join(", ")
                        childdata = childdata + "&quot;RStrategy&quot;:&quot;" + rstrat + "&quot;,";
                        if (allrstrategy.indexOf(rstrat) == -1)
                            allrstrategy.push(rstrat);
                        var desc = (taskitem.Description != null ? taskitem.Description : "");
                        childdata = childdata + "&quot;Description&quot;:&quot;" + desc + "&quot;,";
                        allDescription = allDescription + desc;
                        var url = taskitem.Attachments ? taskitem.AttachmentFiles.results[0].ServerRelativeUrl : "";
                        var filename = taskitem.Attachments ? taskitem.AttachmentFiles.results[0].FileName : "";
                        childdata = childdata + "&quot;Attachment&quot;:&quot;" + url + "&quot;,";
                        childdata = childdata + "&quot;FileName&quot;:&quot;" + filename + "&quot;,";
                        childdata = childdata + "&quot;S2H&quot;:&quot;" + taskitem.S_2h + "&quot;,";
                        childdata = childdata + "&quot;S24H&quot;:&quot;" + taskitem.S_24h + "&quot;,";
                        childdata = childdata + "&quot;S3D&quot;:&quot;" + taskitem.S_3d + "&quot;,";
                        childdata = childdata + "&quot;S1W&quot;:&quot;" + taskitem.S_1w + "&quot;,";
                        childdata = childdata + "&quot;S1M&quot;:&quot;" + taskitem.S_1m + "&quot;,";
                        childdata = childdata + "&quot;Total&quot;:&quot;" + taskitem.Total + "&quot;";
                        childdata = childdata + "},"

                    });
                    childdata = childdata.replace(/,\s*$/, "");
                    childdata = childdata + "]";
                    childdata = childdata + '}';
                    resultdata = resultdata + '"Title":"' + tasktitle + '",';
                    resultdata = resultdata + '"TotalCount":"' + ReturnedTask.length.toString() + '",';
                    resultdata = resultdata + '"ChildNode":"' + childdata + '",';
                    resultdata = resultdata + '"AllTaskName":"' + alltaskname + '",';
                    resultdata = resultdata + '"AllStrategy":"' + allrstrategy.join(", ") + '",';
                    resultdata = resultdata + '"AllDescription":"' + allDescription + '"';
                    resultdata = resultdata + "},";
                });
                resultdata = resultdata.replace(/,\s*$/, "");
                resultdata = resultdata + "]";
                resultdata = resultdata + '}';
                workspacedata = JSON.parse(resultdata);
                GenerateDataTable();
                $('#loading').css('display', 'none');
            }
            else {
                WorkspaceDatatable = $('#tblWorkspace').DataTable();
                $('#loading').css('display', 'none');
                if ($('#hdnUserPermission').val() == "YES") {
                    $('div.dataTables_length').after('<div  align="left" style="float:right;padding-right:2px"><button class="btnStyle" onclick="return ShowNewForm();"  style="padding-right:5px;">' + BUTTON_ADDNEWTASK + '</button></div>');
                    $('div.dataTables_length').after('<div  align="left" style="float:right;padding-right:5px"><button class="btnStyle" onclick="return ShowHideColumns();" style="padding-right:5px;">' + BUTTON_SHOWNEWCOLUMNS + '</button></div>');
                }
            }
        },
        error: function (xhr, status, error) {
            alert(ERROR_UNEXPECTED_LIST.replace('{0}', LIST_WORKSPACE) + JSON.stringify(error + xhr.responseText));
        }
    });

}

function GenerateDataTable() {
    try {
        var WorkspaceDatatable = $('#tblWorkspace').DataTable();
        if (WorkspaceDatatable != 'undefined') {
            WorkspaceDatatable.destroy();
        }
        var QSfilter = false;
        WorkspaceDatatable = $('#tblWorkspace').DataTable({
            data: workspacedata.data,
            "language": {
                "infoEmpty": "No records available",
            },
            columns:
            [
                {
                    "className": 'details-control',
                    "orderable": false,
                    "defaultContent": '',
                    "width": "3%",
                    "bSearchable": false,
                    "render": function (data, type, row) {
                        return "<span class=\"glyphicon glyphicon-plus\" style=\"color:#009\"></span>";
                    }

                },
                {
                    "mData": "Title",
                    "width": "87%"
                },
                {
                    "mData": "TotalCount",
                    "className": 'tdcenteralign',
                    "width": "10%"
                },
                {
                    "mData": "ChildNode",
                    "visible": false
                },
                {
                    "mData": "AllTaskName",
                    "visible": false
                },
                {
                    "mData": "AllStrategy",
                    "visible": false
                },
                {
                    "mData": "AllDescription",
                    "visible": false
                }
            ],
            "bAutoWidth": false,
            order: [[lastsortcol, lastsortorder]],
            "iDisplayLength": lastdisplaylength,
            "displayStart": (lastpage == 0 ? 0 : lastpage * 10),
            "rowCallback": function (row, data, index) {
                var rowtitle = data.Title.split(' ')[0].toString().replace(/ /g, "");
                $(row).addClass("parentrow" + rowtitle);
                if (alltablerows.indexOf(rowtitle) == -1)
                    alltablerows.push(rowtitle);
                //$(row).addClass("tr" + data.Title.replace(' ', '').toString()); 
            },
            "fnDrawCallback": function (oSettings) {
                var allshown = true;
                $('#tblWorkspace>tbody>tr.odd,#tblWorkspace>tbody>tr.even').each(function (index, elem) {
                    var $elem = $(elem);
                    if ($elem[0].className.indexOf('shown') == -1)
                        allshown = false;
                });
                //if (allshown) { $('#imgheader').attr("src", '../SiteAssets/images/details_close.png'); $('#imgheader').attr("title", 'close all'); }
                //else { $('#imgheader').attr("src", '../SiteAssets/images/details_open.png'); $('#imgheader').attr("title", 'open all'); };
            }
        });
        //on click event of plus and minus button  
        $('#tblWorkspace tbody').on('click', 'td.details-control', function () {
            tr_clicked = $(this).closest('tr');
            row_clicked = WorkspaceDatatable.row(tr_clicked);
            OpenCloseEvent(false, false);
        });
        $('#tblWorkspace thead').on('click', 'th', function () {
            lastsortcol = WorkspaceDatatable.order()[0][0];
            lastsortorder = WorkspaceDatatable.order()[0][1];
        });
        $('.dataTables_filter input').on('keyup', function () {
            $('#hdnSearchText').val($(this).val());
            if ($('#hdnSearchText').val()) {
                $.each(alltablerows, function (index, value) {
                    tr_clicked = $('.parentrow' + value.toString());
                    row_clicked = WorkspaceDatatable.row(tr_clicked);
                    OpenCloseEvent(false, true);
                });
            }
            else
                DrawMultiFilterTable();
            SearchChildTable("", "");
        });
        $('#tblWorkspace').on('page.dt', function () {
            var info = WorkspaceDatatable.page.info();
            var page = info.page;
            lastpage = page;
        });
        $('#tblWorkspace').on('length.dt', function (e, settings, len) {
            lastdisplaylength = len;

        });
        //var optiontext = LABEL_MOREOPTION;
        //if ($('#divSearch').css('display') != 'none') optiontext = LABEL_LESSOPTION;
        //$('div.dataTables_filter').after('<div align="left" class="moreoption" style="padding-top:10px"><a id="aMoreoption" onclick="ShowHideDiv();"  style="font-size:10px;cursor:pointer;padding-left:2px;">' + optiontext + '</a></div>');
        if ($('#hdnUserPermission').val() == "YES") {
            $('div.dataTables_length').after('<div  align="left" style="float:right;padding-right:2px"><button class="btnStyle" onclick="return ShowNewForm();"  style="padding-right:5px;">' + BUTTON_ADDNEWTASK + '</button></div>');
            $('div.dataTables_length').after('<div  align="left" style="float:right;padding-right:5px"><button class="btnStyle" onclick="return ShowHideColumns();" style="padding-right:5px;">' + BUTTON_SHOWNEWCOLUMNS + '</button></div>');
        }

        $('#firstcolumn').off('click');
        if ($('#hdnSearchText').val() != "") {
            $('.dataTables_filter input').val($('#hdnSearchText').val());
            WorkspaceDatatable.search($('#hdnSearchText').val()).draw();
        }
        DrawMultiFilterTable("", "");
        $.each(clickeditem, function (index, value) {
            tr_clicked = $('.parentrow' + value.toString());
            row_clicked = WorkspaceDatatable.row(tr_clicked);
            OpenCloseEvent(true, false);
        });
        SearchChildTable("", "");
        //if ($('#hdnUserPermission').val() != "YES") {
        //    $.each(alltablerows, function (index, value) {
        //        tr_clicked = $('.parentrow' + value.toString());
        //        row_clicked = WorkspaceDatatable.row(tr_clicked);
        //        OpenCloseEvent(false, true);
        //    });
        //}
    } catch (e) {
        alert(ERROR_GENERATE_SEARCH_TABLE + e.message);
    }
}

function GenerateChildTable(tableid, data) {
    try {
        var ChildTable = $('#' + tableid).DataTable();
        if (ChildTable != 'undefined') {
            ChildTable.destroy();
        }
        var QSfilter = false;
        var columns = $("#hdncolumns").val();
        var width = 22;
        var rstatview = true;
        var descriptionview = true;
        var s2hview = true;
        var s24hview = true;
        var s3dview = true;
        var s1wview = true;
        var s1mview = true;
        var totalview = true;
        if (columns.indexOf("RecoveryStrategy") !== -1) { rstatview = false; } else width = width + 20;
        if (columns.indexOf("Description") !== -1) { descriptionview = false; } else width = width + 28;
        if (columns.indexOf("S2H") !== -1) { s2hview = false; } else width = width + 5;
        if (columns.indexOf("S24H") !== -1) { s24hview = false; } else width = width + 5;
        if (columns.indexOf("S3D") !== -1) { s3dview = false; } else width = width + 5;
        if (columns.indexOf("S1W") !== -1) { s1wview = false; } else width = width + 5;
        if (columns.indexOf("S1M") !== -1) { s1mview = false; } else width = width + 5;
        if (columns.indexOf("Total") !== -1) { totalview = false; } else width = width + 5;

        var EditView = ($('#hdnUserPermission').val() == "YES" ? true : false);
        var jsdata = JSON.parse(data.replace(/&quot;/g, "\""));
        ChildTable = $('#' + tableid).DataTable({
            data: jsdata.data,
            columns:
            [
                {
                    "mData": "Attachment",
                    "render": function (data, type, row) {
                        if (row.Attachment)
                            return "<span><a href='" + row.Attachment + "' target='_blank'><img width='16' height='16' src='/_layouts/15/images/attach16.png?rev=23' border='0' title='" + row.FileName + "'></a></span>"
                        else
                            return "";
                    },
                    "width": "2%",
                    "bSearchable": false
                },
                {
                    "mData": "TaskName",
                    "render": function (data, type, row) {
                        return "<span>" + row.TaskName + "</span>"
                    },
                    "width": "20%"
                },
                {
                    "mData": "RStrategy",
                    "render": function (data, type, row) {
                        return "<span>" + row.RStrategy + "</span>"
                    },
                    "visible": rstatview,
                    "width": "20%"
                },
                {
                    "mData": "Description",
                    "visible": descriptionview,
                    "render": function (data, type, row) {
                        return "<span>" + row.Description + "</span>"
                    },
                    "width": "28%"
                },
                {
                    "mData": "S2H",
                    "visible": s2hview,
                    "className": 'tdcenteralign',
                    "render": function (data, type, row) {
                        return "<span>" + row.S2H + "</span>"
                    },
                    "width": "5%"
                },
                {
                    "mData": "S24H",
                    "visible": s24hview,
                    "className": 'tdcenteralign',
                    "render": function (data, type, row) {
                        return "<span>" + row.S24H + "</span>"
                    },
                    "width": "5%"
                },
                {
                    "mData": "S3D",
                    "visible": s3dview,
                    "className": 'tdcenteralign',
                    "render": function (data, type, row) {
                        return "<span>" + row.S3D + "</span>"
                    },
                    "width": "5%"
                },
                {
                    "mData": "S1W",
                    "visible": s1wview,
                    "className": 'tdcenteralign',
                    "render": function (data, type, row) {
                        return "<span>" + row.S1W + "</span>"
                    },
                    "width": "5%"
                },
                {
                    "mData": "S1M",
                    "visible": s1mview,
                    "className": 'tdcenteralign',
                    "render": function (data, type, row) {
                        return "<span>" + row.S1M + "</span>"
                    },
                    "width": "5%"
                },
                 {
                     "mData": "Total",
                     "visible": totalview,
                     "className": 'tdcenteralign',
                     "render": function (data, type, row) {
                         return "<span>" + Math.round(row.Total).toString() + "</span>"
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
                },
                {
                    "mData": "TaskType",
                    "visible": false
                }
            ],
            "bAutoWidth": false,
            "paging": false,
            "info": true,
            "columnDefs": [{
                "targets": [0, 10],
                "orderable": false
            }],
            //searchHighlight: true,
            order: [[1, 'asc']],
            "drawCallback": function (settings) {
                $('#' + tableid + ' td span').each(function (index, elem) {
                    var $elem = $(elem);
                    if ($('#hdnSearchText').val().length > 0 && $elem.text().toLowerCase().indexOf($('#hdnSearchText').val().toLowerCase()) != -1) {
                        $elem.css('backgroundColor', 'yellow');
                    }
                    else {
                        $elem.css('backgroundColor', '');
                    }
                });
                $('#' + tableid + ' td span a[title]').each(function (index, elem) {
                    var $elem = $(elem);
                    if ($('#hdnSearchText').val().length > 0 && elem.title.toLowerCase().indexOf($('#hdnSearchText').val().toLowerCase()) != -1) {
                        $elem.parent().css('backgroundColor', 'yellow');
                        $elem.parent().css('border', '1px solid red');
                        //$elem.parent().css('padding', '2px');
                    }
                    else {
                        $elem.parent().css('backgroundColor', '');
                        $elem.parent().css('border', '0px solid red');
                        //$elem.parent().css('padding', '0px');
                    }
                });
            }
        });

        $('#col1' + tableid).off('click');
        //if (Statusview) $('#col8' + tableid).off('click');
        if (EditView) $('#col11' + tableid).off('click');
        $('#' + tableid + "_filter").css("display", "none");
        $('#' + tableid + "_info").css("display", "none");
    } catch (e) {
        alert(ERROR_GENERATE_SEARCH_TABLE + e.message);
    }
}

function OpenCloseEvent(internalload, onlyopen) {
    try {
        if (tr_clicked != null && row_clicked != null && row_clicked.child.isShown() != null && row_clicked.data() != null) {
            var clickedtitle = row_clicked.data().Title.split(' ')[0].replace(/ /g, "");
            //var clickedindex = row_clicked.index();
            var tableid = "dtChild" + clickedtitle;
            var span = tr_clicked.find('span:first');
            if (!onlyopen) {
                if (row_clicked.child.isShown()) {
                    tr_clicked.removeClass('shown');
                    // This row is already open - close it
                    row_clicked.child.hide();
                    clickeditem = $.grep(clickeditem, function (value) {
                        return value != clickedtitle;
                    });
                    childdatatablesid = $.grep(childdatatablesid, function (value) {
                        return value != tableid;
                    });
                    span.removeClass('glyphicon-minus');
                    span.addClass('glyphicon-plus');
                }
                else {
                    // Open this row
                    if (row_clicked.data() != null) {
                        row_clicked.child(formatrow(tableid)).show();
                        tr_clicked.addClass('shown');
                        GenerateChildTable(tableid, row_clicked.data().ChildNode);
                        var checkifexists = $.inArray(clickedtitle, clickeditem);
                        if (checkifexists == -1 && !internalload)
                            clickeditem.push(clickedtitle);
                        span.removeClass('glyphicon-plus');
                        span.addClass('glyphicon-minus');
                    }
                }
            }
            else {
                if (row_clicked.data() != null && !row_clicked.child.isShown()) {
                    row_clicked.child(formatrow(tableid)).show();
                    tr_clicked.addClass('shown');
                    GenerateChildTable(tableid, row_clicked.data().ChildNode);
                    //if (!internalload) SearchChildTable('', '');
                    var checkifexists = $.inArray(clickedtitle, clickeditem);
                    if (checkifexists == -1 && !internalload)
                        clickeditem.push(clickedtitle);
                    span.removeClass('glyphicon-plus');
                    span.addClass('glyphicon-minus');
                }
            }
            var allshown = true;
            $('#tblWorkspace>tbody>tr.odd,#tblWorkspace>tbody>tr.even').each(function (index, elem) {
                var $elem = $(elem);
                if ($elem[0].className.indexOf('shown') == -1)
                    allshown = false;
            });
            //if (allshown) { $('#imgheader').attr("src", '../SiteAssets/images/details_close.png'); $('#imgheader').attr("title", 'close all'); }
            //else { $('#imgheader').attr("src", '../SiteAssets/images/details_open.png'); $('#imgheader').attr("title", 'open all'); };
        }
    }
    catch (err) {
        //alert('Error in child node');
    }
}

function formatrow(tableid) {
    var checkifexists = $.inArray(tableid, childdatatablesid);
    if (checkifexists == -1)
        childdatatablesid.push(tableid);
    var columns = $("#hdncolumns").val();
    var width = 22;
    var rstatview = true;
    var descriptionview = true;
    var s2hview = true;
    var s24hview = true;
    var s3dview = true;
    var s1wview = true;
    var s1mview = true;
    var totalview = true;
    if (columns.indexOf("RecoveryStrategy") !== -1) { rstatview = false; } else width = width + 20;
    if (columns.indexOf("Description") !== -1) { descriptionview = false; } else width = width + 28;
    if (columns.indexOf("S2H") !== -1) { s2hview = false; } else width = width + 5;
    if (columns.indexOf("S24H") !== -1) { s24hview = false; } else width = width + 5;
    if (columns.indexOf("S3D") !== -1) { s3dview = false; } else width = width + 5;
    if (columns.indexOf("S1W") !== -1) { s1wview = false; } else width = width + 5;
    if (columns.indexOf("S1M") !== -1) { s1mview = false; } else width = width + 5;
    if (columns.indexOf("Total") !== -1) { totalview = false; } else width = width + 5;
    var EditView = ($('#hdnUserPermission').val() == "YES" ? true : false);
    var datatrow = "<table id='" + tableid + "' class='table table-striped table-bordered' align='left' style='width:" + width.toString() + "%'><thead><tr>";
    datatrow = datatrow + "<th rowspan='2' class='tdcenteralign disablebutton' id=col1" + tableid + "><img width='16' height='16' src='/_layouts/15/images/attach16.png?rev=23' border='0' title='" + TABLE_HEADER_ADDITIONAL_INFO + "'/></th>";
    datatrow = datatrow + "<th rowspan='2' class='tdcenteralign' id=col2" + tableid + ">" + TABLE_HEADER_TASKNAME + "</th>";
    datatrow = datatrow + "<th rowspan='2' class='tdcenteralign' id=col3" + tableid + "" + (rstatview ? "" : "style='display:none'") + ">" + TABLE_HEADER_RECOVERY + "</th>";
    datatrow = datatrow + "<th rowspan='2' class='tdcenteralign' id=col4" + tableid + "" + (descriptionview ? "" : "style='display:none'") + ">" + TABLE_HEADER_DESCRIPTION + "</th>";
    datatrow = datatrow + "<th colspan='6' id=col12" + tableid + "" + (s2hview || s24hview || s3dview || s1wview || s1mview || totalview ? "" : "style='display:none'") + ">" + TABLE_HEADER_NUMBER_OF_STAFFS + "</th>";
    datatrow = datatrow + "<th rowspan='2' class='tdcenteralign disablebutton' id=col11" + tableid + "" + (EditView ? "" : "style='display:none'") + ">" + BUTTON_EDIT + "</th><th  rowspan='2' style='display:none'></th></tr>";

    datatrow = datatrow + "<tr><th id=col5" + tableid + "" + (s2hview ? "" : "style='display:none'") + ">" + TABLE_HEADER_S2H + "</th>";
    datatrow = datatrow + "<th id=col6" + tableid + "" + (s24hview ? "" : "style='display:none'") + ">" + TABLE_HEADER_S24H + "</th>";
    datatrow = datatrow + "<th id=col7" + tableid + "" + (s3dview ? "" : "style='display:none'") + ">" + TABLE_HEADER_S3D + "</th>";
    datatrow = datatrow + "<th id=col8" + tableid + "" + (s1wview ? "" : "style='display:none'") + ">" + TABLE_HEADER_S1W + "</th>";
    datatrow = datatrow + "<th id=col9" + tableid + "" + (s1mview ? "" : "style='display:none'") + ">" + TABLE_HEADER_S1M + "</th>";
    datatrow = datatrow + "<th id=col10" + tableid + "" + (totalview ? "" : "style='display:none'") + ">" + TABLE_HEADER_TOTAL_STAFFS + "</th>";
    
    datatrow = datatrow + "</tr></thead></table>";
    return datatrow;
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
    var height = window.innerHeight / 1.4;
    var options = {
        title: LABEL_EDITFORM,
        width: width,
        height: height,
        url: "../Lists/" + LIST_WORKSPACE + "/EditForm.aspx?ID=" + id + "&Source=" + document.URL,
        dialogReturnValueCallback: function (result, target) { if (result == SP.UI.DialogResult.OK) { LoadWorkSpaceTable(true); } }
    };
    SP.UI.ModalDialog.showModalDialog(options);
    return false;
}

function ShowNewForm() {
    var options = {
        title: LABEL_NEWFORM,
        width: 900,
        height: 800,
        url: "../Lists/" + LIST_WORKSPACE + "/NewForm.aspx",
        dialogReturnValueCallback: function (result, target) { if (result == SP.UI.DialogResult.OK) { LoadWorkSpaceTable(true); } }
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
        LoadWorkSpaceTable(false);
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
            LoadWorkSpaceTable(false);
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
        SearchChildTable("", "");
    }
}

function SearchChildTable(id, val) {
    var QSfilter = false;
    if ($('#hdnrstrategy').val() != "")
    { if ($('#hdnallrstrategy').val().toLowerCase().indexOf($('#hdnrstrategy').val().toLowerCase() + ",") != -1) $('#txtRstrategy').val($('#hdnrstrategy').val()); QSfilter = true; }
    var rstat = $('#txtRstrategy').val();
    if (id == "Rstrategy") rstat = val;
    if (QSfilter || rstat != "" || $('#hdnSearchText').val() != '') {
        $.each(childdatatablesid, function (tableindex, tableitem) {
            var oTable = $('#' + tableitem).DataTable();
            var oSettings = oTable.settings();
            if (oSettings.length > 0) {
                oSettings[0].aoPreSearchCols[2].sSearch = rstat;
                oTable.draw();
                //    if ($('#hdnSearchText').val() != "")
                //        oTable.search($('#hdnSearchText').val()).draw();
                //    else
                //        oTable.search("").draw();
            }
        });
    }
    else {
        $.each(childdatatablesid, function (tableindex, tableitem) {
            var oTable = $('#' + tableitem).DataTable();
            var oSettings = oTable.settings();
            if (oSettings.length > 0) {
                oSettings[0].aoPreSearchCols[2].sSearch = rstat;
                oTable.draw();
                //oTable.search($('#hdnSearchText').val()).draw(); 
            }
            //$('#' + childdatatablesid + ' td span').each(function (index, elem) {
            //    var $elem = $(elem);
            //    if ($('#hdnSearchText').val().length > 0 && $elem.text().toLowerCase().indexOf($('#hdnSearchText').val().toLowerCase()) != -1) {
            //        $elem.css('backgroundColor', 'yellow');
            //    }
            //    else {
            //        $elem.css('backgroundColor', '');
            //    }
            //});
        });
    }

}