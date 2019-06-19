
var token = Cookies.get('token');
token = '&token=' + token + "&audience=" + navigator.userAgent;

var loadingDialog = bootbox.dialog({
    message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Loading...</div>',
    closeButton: false,
    centerVertical: true,
    show: false,

})

var numUpdate = 0;
const maxUpdate = 1;
// 0 - PendingPost table
// 1 - ProcessPost table
var viewFrom = 0;
//var getAllCategory = {};
//getAllCategory();
$(document).ready(function () {

    updatePendingPostTable();
    updateProcessPostTable();

    $(document).on("shown.bs.modal", (e) => {
        if (numUpdate == 0) {
            loadingDialog.modal('hide');
        }
    })

    $("#selCat").change(() => {
        updatePendingPostTable();
    })

    $('[data-toggle="tooltip"]').tooltip();
    $(".btn-primary").click(function () {
        var row = $(this).parent().parent().parent().parent();
        var data = [];
        title = row.children().eq(0).html();
        author = row.children().eq(1).html();
        data.push(title);
        data.push(author);
        UpdateModelBody(data);
    });
    $("#postAccept_releaseDate").datepicker({
        autoclose: true,
        todayHighlight: true
    }).datepicker('update', new Date());

    $(document).on('click', 'button[idpost]', function (event) {
        var triggerElement = $(event.target);
        if (triggerElement.hasClass('far fa-eye')) triggerElement = triggerElement.parent();
        var modal = $('#postView');
        var idpost = triggerElement.attr('idpost');
        if (triggerElement.attr('viewbtn') == '0') {
            modal.find('button[class="btn btn-success"]').css('visibility', 'hidden');
            modal.find('button[class="btn btn-danger"]').css('visibility', 'hidden');
        } else {
            modal.find('button[class="btn btn-success"]').css('visibility', 'visible');
            modal.find('button[class="btn btn-danger"]').css('visibility', 'visible');
        }

        $.ajax({
            url: '/api/admin/post?id=' + idpost,
            type: 'GET',
            data: token,
            success: function (res) {
                modal.attr('idpost', idpost);
                modal.find('h4[class="modal-title"]').text(res.title);
                modal.find('div[class="modal-body"]').html(res.content);
                modal.modal('show');
            },
            error: function (res) {
                Message('Lấy thông tin bài viết thất bại! ' + res.responseText, false);
            }
        });
   });

    $(document).on('click', 'button[title="Duyệt"]', function (event) {
        var triggerElement = $(event.target);
        if (triggerElement.hasClass('far fa-thumbs-up')) triggerElement = triggerElement.parent();
        var parent = triggerElement.closest('tr[class="table-row"]');
        var idpost = parent.children(':nth-child(2)').attr('idpost');
        PostAccept(idpost, parent.children(':nth-child(2)').text());
    });

    $(document).on('click', 'button[title="Từ chối"]', function (event) {
        var triggerElement = $(event.target);
        if (triggerElement.hasClass('far fa-ban')) triggerElement = triggerElement.parent();
        var parent = triggerElement.closest('tr[class="table-row"]');
        var idpost = parent.children(':nth-child(2)').attr('idpost');
        PostReject(idpost, parent.children(':nth-child(2)').text());
    });
});

function UpdateModelBody(data) {
    // alert(data[0] + ' - ' + data[1]);
    // alert($('#postView').find(".modal-title").text());
    $('#postView').find(".modal-title").text(data[0] + ' - ' + data[1]);
}

function PostReject(idpost, title) {
    if (!idpost) { // call from modal
        idpost = $('#postView').attr('idpost');
        $('#postView').modal('hide');
        title = "Từ chối: " + $('#postView').find(".modal-title").text();
    }

    $('#postReject').find(".modal-title").text(title);
    $('#postReject').attr('idpost', idpost)
    $('#postReject').modal({ backdrop: 'static', keyboard: false });
}

function PostAccept(idpost, title) {
    if (!idpost) { // call from modal
        $('#postView').modal('hide');
        idpost = $('#postView').attr('idpost');
        title = "<b>Duyệt bài</b>: " + $('#postView').find(".modal-title").text();
    }

    $('#postAccept').find(".modal-title").text(title);
    $('#postAccept').attr('idpost', idpost)
    $('#postAccept').modal({ backdrop: 'static', keyboard: false });
}

function PostAcceptFinish() {
    var idpost = $('#postAccept').attr('idpost');
    var publishDate = $('#postAccept_releaseDate').val();
    $.ajax({
        url: '/api/editor/action?id=' + idpost + '&action=accept' + '&date=' + publishDate,
        type: 'POST',
        data: token,
        success: function (res) {
            $('#postAccept').modal('hide');
            Message('Cập nhật trạng thái bài viết thành công! ',true);
            updatePendingPostTable();
            updateProcessPostTable();
        },
        error: function (res) {
            $('#postAccept').modal('hide');
            Message('Cập nhật trạng thái bài viết thất bại! ' + res.responseText, false);
        }
    })
}

function PostRejectFinish() {
    var idpost = $('#postReject').attr('idpost');
    var rejectReason = $('#reject_reason').val();
    $.ajax({
        url: '/api/editor/action?id=' + idpost + '&action=reject' + '&msg=' + rejectReason,
        type: 'POST',
        data: token,
        success: function (res) {
            $('#postReject').modal('hide');
            Message('Cập nhật trạng thái bài viết thành công! ',true);
            updatePendingPostTable();
            updateProcessPostTable();
        },
        error: function (res) {
            $('#postReject').modal('hide');
            Message('Cập nhật trạng thái bài viết thất bại! ' + res.responseText, false);
        }
    })
}

function createPendingPostEl(data, indexNum) {
    var tr = document.createElement('tr'); tr.setAttribute('class', 'table-row');
    var index = document.createElement('td'); index.textContent = indexNum;
    var title = document.createElement('td'); title.textContent = data.title;
    title.setAttribute('idpost', data.id);

    var category = document.createElement('td'); category.textContent = data.category;
    var author = document.createElement('td'); author.textContent = data.author;


    var action = document.createElement('td');
    action.innerHTML = `<td>
                            <div class="btn-group">
                                    <button idpost='${data.id}' class="btn btn-primary" type="button" data-toggle="tooltip"
                                        data-placement="top" title="Xem"><i class="far fa-eye"></i></i></button>
                                <button class="btn btn-success" type="button" data-toggle="tooltip"
                                    data-placement="top" title="Duyệt"><i class="far fa-thumbs-up"></i></button>
                                <button class="btn btn-danger" type="button" data-toggle="tooltip"
                                    data-placement="top" title="Từ chối"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>`;
    tr.append(index);
    tr.append(title);
    tr.append(author);
    tr.append(category);
    tr.append(action);
    return tr;
}

function createProcessPostEl(data, indexNum) {
    var tr = document.createElement('tr'); tr.setAttribute('class', 'table-row');
    var index = document.createElement('td'); index.textContent = indexNum;
    var title = document.createElement('td'); title.textContent = data.title;
    title.setAttribute('idpost', data.id);

    var category = document.createElement('td'); category.textContent = data.category;
    var author = document.createElement('td'); author.textContent = data.author;
    var state = document.createElement('td'); state.textContent = data.state;


    var action = document.createElement('td');
    action.innerHTML = `<td>
                            <div class="btn-group">
                                    <button idpost='${data.id}' viewbtn='0' class="btn btn-primary" type="button" data-toggle="tooltip"
                                        data-placement="top" title="Xem"><i class="far fa-eye"></i></i></button>
                            </div>
                        </td>`;
    tr.append(index);
    tr.append(title);
    tr.append(author);
    tr.append(category);
    tr.append(state);
    tr.append(action);
    return tr;
}

function updatePendingPostTable(sources) {
    var selectOpt = $("#selCat option:selected").val();
    var category = [];
    if (selectOpt == 'Tất cả') {
        $("#selCat option").each((index, element) => {
            var par = $(element).val();
            if (par == 'Tất cả') return;
            console.log(par);
            var v = $(element).val();
            console.log(v);
            category.push({'category': v});
        })
    } else category.push({'category': $("#selCat option:selected").val()});


    if (!sources) sources = '/api/admin/post?type=simple&' + $.param({filter: {$or: category, status: 2}});
    console.log(sources);
    updateTable(sources, '#pagination_PendingPost', "#tbPendingPost", createPendingPostEl)
}

function updateProcessPostTable(sources) {
    var selectOpt = $("#selCat2 option:selected").val();
    var category = [];
    if (selectOpt == 'Tất cả') {
        $("#selCat option").each((index, element) => {
            var par = $(element).val();
            if (par == 'Tất cả') return;
            var v = $(element).val();
            category.push({'category': v});
        })
    } else category.push({'category': $("#selCat option:selected").val()});


    if (!sources) sources = '/api/admin/post?type=simple&' + $.param({filter: {$and: [{$or: category}, {$or: [{status: 3}, {status: 5}]}]}});

    console.log(sources);
    updateTable(sources, '#pagination_ProcessPost', "#tbProcessPost", createProcessPostEl)
}

function updateTable(sources, pagination, table, createElFunc) {
    loadingDialog.modal('show');
    var options = {
        dataSource: sources,
        locator: 'data',
        showPageNumbers: true,
        showPrevious: true,
        showNext: true,
        showNavigator: true,
        pageNumber: 1,
        prevText: '<i class="fa fa-angle-double-left"></i>',
        nextText: '<i class="fa fa-angle-double-right"></i>',
        pageSize: 5,
        alias: {
            pageNumber: 'page',
            pageSize: 'perpage'
        },
        className: 'paginationjs-theme-blue',
        totalNumberLocator: function (response) {
            return response.total;
        },
        callback: function (data, pagination) {
            var begin = (pagination.pageNumber - 1) * 5;
            var container = $(table + " tbody");
            container.empty();
            data.forEach((element, index) => {
                container.append(createElFunc(element, begin + index + 1));
            })
            numUpdate += 1;
            if (numUpdate == maxUpdate) {
                numUpdate = 0;
                loadingDialog.modal('hide');
            }
        },
    }
    if (typeof (sources) == "string") {
        if (sources.indexOf('?') == -1)
            options.dataSource = sources + '?token=' + Cookies.get('token') + "&audience=" + navigator.userAgent;
        else options.dataSource = sources + '&token=' + Cookies.get('token') + "&audience=" + navigator.userAgent;
    }
    $(pagination).pagination(options)
}

function Message(msg, isSuccess) {
    bootbox.alert({
        message: msg,
        className: isSuccess?'border border-success': 'border border-danger',
        centerVertical: true
    })
}

function getAllCategory() {
    var data = { token: Cookies.get('token'), audience: navigator.userAgent };
    $.ajax({
        url: '/api/admin/category',
        type: 'GET',
        data: data,
        success: function (res) {
            allCategory = res.data;
        },
        error: function (err) {
            Message('Không thể lấy thông tin chuyên mục! ' + err, false);
        }
    })
}