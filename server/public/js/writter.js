

var loadingDialog = bootbox.dialog({
    message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Loading...</div>',
    closeButton: false,
    centerVertical: true,
    show: false,

})

CKEDITOR.config.entities = false;
CKEDITOR.replace('post_content');
var _image_url = "#";
var numUpdate = 0;
const maxUpdate = 2;



$(document).ready(() => {
    updatePostTable();
    $(document).on("shown.bs.modal", (e) => {
        console.log("Num: " + numUpdate);
        if (numUpdate == 0) {
            loadingDialog.modal('hide');
        }
    })

    $("#tbPost tbody").on("click", "tr", (event) => {
        var elementName = $(event.currentTarget).children(":nth-child(2)");
        console.log($(this));
        console.log($(event));
        var idpost = elementName.attr('idpost');
        if (event.target.className == 'btn btn-warning' || event.target.className == 'far fa-edit') {
            $.ajax({
                url: '/api/admin/post?id=' + idpost,
                type: 'GET',
                data: {token: Cookies.get('token'), audience: navigator.userAgent},
                success: function (response) {
                    console.log(response);
                    $('#newpost h1').text("Chỉnh sửa bài viết");
                    $('#newpost').attr('idpost', response._id);
                    $('#post_title').val(response.title);
                    $('#post_summary').val(response.summary);
                    CKEDITOR.instances.post_content.setData(response.content);
                    $('#post_tag').val(response.tag);
                    $('#sendPost').text("Cập nhật");
                    $("#postAvatar").attr("src", response.image_url);
                    $("#post_tag").text("src", response.tag);
                    $('.nav-tabs li:eq(1) a').tab('show');
                },
                error: (err) => {
                    Message("Không thể lấy thông tin chi tiết bài viết " + elementName.text());
                    console.log(err);
                }
            });
        }else if (event.target.className =='far fa-trash-alt' || event.target.className == 'btn btn-danger') {
            bootbox.confirm({buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },message: "Bạn chắc chắn muốn xóa bài viết này chứ?", callback: (result) =>{
                if (result) {
                    deletePost(idpost);
                }
            },centerVertical: true})
        }
    })

    $("#allBtn").click((e) => {
        numUpdate = 1;
        $("#allBtn").attr('class', 'btn btn-primary')
        $("#approveBtn").attr('class', 'btn btn-outline-primary')
        $("#publishBtn").attr('class', 'btn btn-outline-primary')
        $("#rejectBtn").attr('class', 'btn btn-outline-primary')
        $("#waitingBtn").attr('class', 'btn btn-outline-primary')
        $("#draftBtn").attr('class', 'btn btn-outline-dark')
        updatePostTable()
    })

    $("#approveBtn").click((e) => {
        numUpdate = 1;
        $("#approveBtn").attr('class', 'btn btn-primary')
        $("#publishBtn").attr('class', 'btn btn-outline-primary')
        $("#rejectBtn").attr('class', 'btn btn-outline-primary')
        $("#waitingBtn").attr('class', 'btn btn-outline-primary')
        $("#draftBtn").attr('class', 'btn btn-outline-dark')
        $("#allBtn").attr('class', 'btn btn-outline-primary')
        updatePostTable(null, 3)
    })

    $("#publishBtn").click((e) => {
        numUpdate = 1;
        $("#publishBtn").attr('class', 'btn btn-primary')
        $("#approveBtn").attr('class', 'btn btn-outline-primary')
        $("#rejectBtn").attr('class', 'btn btn-outline-primary')
        $("#waitingBtn").attr('class', 'btn btn-outline-primary')
        $("#draftBtn").attr('class', 'btn btn-outline-dark')
        $("#allBtn").attr('class', 'btn btn-outline-primary')
        updatePostTable(null, 4)
    })

    $("#rejectBtn").click((e) => {
        numUpdate = 1;
        $("#rejectBtn").attr('class', 'btn btn-primary')
        $("#publishBtn").attr('class', 'btn btn-outline-primary')
        $("#approveBtn").attr('class', 'btn btn-outline-primary')
        $("#waitingBtn").attr('class', 'btn btn-outline-primary')
        $("#draftBtn").attr('class', 'btn btn-outline-dark')
        $("#allBtn").attr('class', 'btn btn-outline-primary')
        updatePostTable(null, 5)
    })

    $("#waitingBtn").click((e) => {
        numUpdate = 1;
        $("#waitingBtn").attr('class', 'btn btn-primary')
        $("#publishBtn").attr('class', 'btn btn-outline-primary')
        $("#rejectBtn").attr('class', 'btn btn-outline-primary')
        $("#approveBtn").attr('class', 'btn btn-outline-primary')
        $("#draftBtn").attr('class', 'btn btn-outline-dark')
        $("#allBtn").attr('class', 'btn btn-outline-primary')
        updatePostTable(null, 2)
    })

    $("#draftBtn").click((e) => {
        numUpdate = 1;
        $("#draftBtn").attr('class', 'btn btn-dark')
        $("#publishBtn").attr('class', 'btn btn-outline-primary')
        $("#rejectBtn").attr('class', 'btn btn-outline-primary')
        $("#waitingBtn").attr('class', 'btn btn-outline-primary')
        $("#approveBtn").attr('class', 'btn btn-outline-primary')
        $("#allBtn").attr('class', 'btn btn-outline-primary')
        updatePostTable(null, 1)
    })

    $("#post_image").change(function () {
        var curFiles = this.files;
        $("#postAvatar").attr("src", window.URL.createObjectURL(curFiles[0]));
    });
})
$(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);

});

// $("#post_image").change(function () {
//     var curFiles = this.files;
//     var token = Cookies.get('token');
//     if (!token) {
//         var inforUrl = location.protocol + '//' + window.location.host + '/';
//         document.location.replace(inforUrl);
//         console.log('Notoken')
//     }

//     var fd = new FormData();
//     fd.append("image", curFiles[0])
//     console.log(fd.toString());
//     $.ajax({
//         url: '/api/post/uploadpostimage?token=' + token + "&audience=" + navigator.userAgent,
//         type: 'POST',
//         data: fd,
//         contentType: false,
//         processData: false,
//         success: function (response) {
//             _image_url = response;
//         },
//         error: (err) => {
//             console.log(err);
//         }
//     });
// });

function uploadpostimage(cb) {
    var text = $('#sendPost').text();
    if (text == 'Cập nhật') {

    }
    var token = Cookies.get('token');
    if (!token) {
        var inforUrl = location.protocol + '//' + window.location.host + '/';
        document.location.replace(inforUrl);
        console.log('Notoken')
    }

    var fd = new FormData();
    var img = document.getElementById('post_image');
    fd.append("image", img.files[0])
    console.log(fd.toString());
    $.ajax({
        url: '/api/post/uploadpostimage?token=' + token + "&audience=" + navigator.userAgent,
        type: 'POST',
        data: fd,
        contentType: false,
        processData: false,
        success: function (response) {
            _image_url = response;
            console.log("Upload success");
            if (cb) cb();
        },
        error: (err) => {
            console.log(err);
        }
    });
}

$("#sendPost").click(function () {
    var text = $('#sendPost').text();
    if (text == 'Gửi bài') uploadpostimage(sendPost)
    else if (text =='Cập nhật') uploadpostimage(() => sendPost(2, true));
    else {
        Message("Unkown text button", false);
    }
    //sendPost();
})

$('#savePost').click(() => {
    var text = $('#sendPost').text();
    if (text == 'Gửi bài') uploadpostimage(() => sendPost(1));
    else if (text =='Cập nhật') uploadpostimage(() => sendPost(1, true));
    else {
        Message("Unkown text button", false);
    }
})

function sendPost(state, isupdate) {
    var token = Cookies.get('token');
    if (!token) {
        var inforUrl = location.protocol + '//' + window.location.host + '/';
        document.location.replace(inforUrl);
    }
    var post = {
        title: document.getElementById("post_title").value,
        category: document.getElementById("post_category_list").value,
        image_url: _image_url,
        tag: document.getElementById("post_tag").value.split(" "),
        content: CKEDITOR.instances.post_content.getData(),
        summary: document.getElementById("post_summary").value
    }
    if (state) post.status = state;
    var url = '/api/post/uploadnewpost'
    if (isupdate) url += '?update=1&id=' +  $('#newpost').attr('idpost');

    $.ajax({
        url: url,
        type: 'POST',
        data: { token: token, audience: navigator.userAgent, post },
        success: function (response) {
            location.reload(true);
            console.log(response);
        },
        error: function (err) {
            Message("Không thể đăng bài viết " + err.responseText, false);
            console.log(err);
        }
    });
}

function createPostEl(data, indexNum) {
    var tr = document.createElement('tr');
    var index = document.createElement('td'); index.textContent = indexNum;
    var title = document.createElement('td'); title.textContent = data.title;
    title.setAttribute('idpost', data.id);

    var category = document.createElement('td'); category.textContent = data.category;
    var state = document.createElement('td'); state.textContent = data.state;
    if (data.state == 'Tạm lưu') state.setAttribute('class', 'text-secondary');
    else if (data.state == 'Chờ duyệt') state.innerHTML = '<span class="badge badge-warning">Chưa được duyệt</span>';
    else if (data.state == 'Đã duyệt') state.innerHTML = '<span class="badge badge-primary">Đã được duyệt</span>';
    else if (data.state == 'Đã xuất bản') state.innerHTML = '<span class="badge badge-success">Đã xuất bản</span>';
    else if (data.state == 'Từ chối') state.innerHTML = ' <span class="badge badge-danger">Đã bị từ chối</span>';
    else state.setAttribute('class', 'text-white bg-dark');
    state.setAttribute('style', 'font-weight:550');

    var action = document.createElement('td');
    action.innerHTML = `<div class="input-group">
    <button class="btn btn-warning" type="button"><i class="far fa-edit"></i></button>
    <div class="input-group-append">
        <button class="btn btn-danger" type="button"><i
                class="far fa-trash-alt"></i></button>
    </div>
</div>`;
    tr.append(index);
    tr.append(title);
    tr.append(category);
    tr.append(state);
    tr.append(action);
    return tr;
}

function updatePostTable(sources, state) {
    if (!sources) {
        sources = '/api/admin/post?type=simple&author=this';
        if (state) sources += '&' + $.param({filter: {status: state}});
        console.log(sources);
    }
    $.ajax({
        url: '/api/admin/post?type=simple&author=this',
        type: 'GET',
        data: { token: Cookies.get('token'), audience: navigator.userAgent },
        success: function (response) {
            var approve = 0;
            var publish = 0;
            var reject = 0;
            var waiting = 0;
            var draft = 0;
            response.data.forEach(element => {
                if (element.state == 'Đã duyệt') approve = approve + 1;
                else if (element.state == 'Đã xuất bản') publish = publish + 1;
                else if (element.state == 'Từ chối') reject = reject + 1;
                else if (element.state == 'Chờ duyệt') waiting = waiting + 1;
                else if (element.state == 'Tạm lưu') draft = draft + 1;
            });
            $("#allBtn").text(`Tất cả (${response.data.length})`);
            $("#approveBtn").text(`Đã được duyệt (${approve})`);
            $("#publishBtn").text(`Đã xuất bản (${publish})`);
            $("#rejectBtn").text(`Bị từ chối (${reject})`);
            $("#waitingBtn").text(`Chưa được duyệt (${waiting})`);
            $("#draftBtn").text(`Tạm lưu (${draft})`);
            numUpdate += 1;
            if (numUpdate == maxUpdate) {
                numUpdate = 0;
                loadingDialog.modal('hide');
            }
        },
        error: function (err) {
            Message("Không thể lấy thông tin bài viết!" + err.responseText);
            console.log(err);
        }
    });
    updateTable(sources, '#pagination_post', "#tbPost", createPostEl)
}


function Message(msg, isSuccess) {
    bootbox.alert({
        message: msg,
        className: isSuccess ? 'border border-success' : 'border border-danger',
        centerVertical: true
    })
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
        pageSize: 10,
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


function deletePost(idpost) {
    $.ajax({
        url: '/api/admin/post',
        type: 'DELETE',
        data: { token: Cookies.get('token'), audience: navigator.userAgent, id: idpost },
        success: function (res) {
            //Message('Xóa bài thành công!', true);
            numUpdate = maxUpdate - 1;
            updatePostTable();
        },
        error: function (res) {
            Message('Xóa bài thất bại! ' + res.responseText, false);

        }
    });
}