const UserRole = {
    NORMAL: 1,
    WRITER: 2,
    SUBSCRIBER: 3,
    EDITOR: 4,
    ADMIN: 5,
}

var oldCategoryValue;
var pagination_category = 1;

var token = Cookies.get('token');
token = '&token=' + token + "&audience=" + navigator.userAgent;

var loadingDialog = bootbox.dialog({ 
    message: '<div class="text-center"><i class="fa fa-spin fa-spinner"></i> Loading...</div>', 
    closeButton: false,
    centerVertical: true,
    show: false,
    
})
var numUpdate = 0;
var maxUpdate = 4;
var allCategory = [];
var data = { token: Cookies.get('token'), audience: navigator.userAgent };
getAllCategory();



$(document).ready(function () {

    updateCategoryTable();
    updateTagTable();
    updatePostTable();
    updateUserTable();

    $(document).on("shown.bs.modal", (e) => {
        if (numUpdate == 0) {
            loadingDialog.modal('hide');
        }
    })
    // Control search box
    $('div[id^="search"]').each(function () {
        var par = $(this);
        var type = getTypeFromId(par.attr('id'));
        var funcName = 'update' + type + 'Table';
        $(this).on('keydown', e => {
            if (e.keyCode == 13) {
                var data = { search: par.children(":nth-child(1)").val(), token: Cookies.get('token'), audience: navigator.userAgent };
                $.ajax({
                    url: '/api/admin/' + type,
                    type: 'GET',
                    data: data,
                    success: function (res) {
                        window[funcName](res);
                    },
                    error: function (res) {
                        Message("Không thể  tìm kiếm! " + res, false);
                    }
                });
            } else if (e.keyCode == 8) { // Backspace
                var length = par.children(":nth-child(1)").val().length;
                if (length == 1) {
                    par.children(":nth-child(3)").css('visibility', 'hidden');
                    window[funcName]();
                    return;
                }
            }
            if (par.children(":nth-child(3)").css('visibility') == 'hidden')
                par.children(":nth-child(3)").css('visibility', 'visible');
        }).on('click', '._clear', e => {
                window[funcName]();
                par.children(":nth-child(1)").val('');
                if (par.children(":nth-child(3)").css('visibility') == 'visible')
                    par.children(":nth-child(3)").css('visibility', 'hidden');
            })
    })

    // Hide all new form
    $('form[id^="new"][id$="Form"]').each(function () {
        $(this).hide();
    });

    // Show/hide form when click new button
    $('button[id^="new"][id$="Btn"]').each(function () {
        $(this).on('click', function (event) {
            var formID = getFormId($(this).attr('id'));
            if($(formID).is(":visible")) $(formID).hide();
            else $(formID).show();
        })
    })

    $("#tbCategory tbody").on('keydown', 'tr :nth-child(2)', function (event) {
        if (event.keyCode == 13) event.preventDefault();
    });
    $("#tbCategory tbody").on('keyup', 'tr :nth-child(2)', function (e) {
        if (e.keyCode == 13 && $(this).attr('contenteditable') == 'true') {
            e.preventDefault();
            var elementGroup = $(this).parent().children(":nth-child(3)")
            $(this).attr('contenteditable', 'false');
            $(this).removeClass('bg-warning');
            updateCategory($(this).text(), elementGroup.text());
        }
    })
    $("#tbCategory tbody").on('focusout', 'tr :nth-child(2)', function (event) {
        var elementGroup = $(this).parent().children(":nth-child(3)")
        if ($(this).attr('contenteditable') == 'true') {
            $(this).attr('contenteditable', 'false');
            $(this).removeClass('bg-warning');
            updateCategory($(this).text(), elementGroup.text());
            return;
        }
    })

    $("#tbCategory tbody").on("click", "tr", function (event) {
        var elementName = $(this).children(":nth-child(2)");
        var elementGroup = $(this).children(":nth-child(3)");

        if (event.target.className == 'fas fa-edit') {
            if (elementName.attr('contenteditable') == 'true') {
                elementName.attr('contenteditable', 'false');
                elementName.removeClass('bg-warning');
                updateCategory(elementName.text(), elementGroup.text());
                return;
            }
            elementName.attr('contenteditable', 'true');
            elementName.addClass('bg-warning').css('padding', '5px');
            elementName.focus();
            oldCategoryValue = elementName.text();
        } else if (event.target.className == 'fas fa-trash-alt') {
            bootbox.confirm({buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },message: "Bạn chắc chắn muốn xóa chuyên mục này chứ?", callback: (result) =>{
                if (result) {
                    deleteCategory(elementName, elementGroup, $(this));
                }
            },centerVertical: true})
            // Delete category
        } else if (event.target.className == 'fas fa-eye') {
            // Update modal
            // Show modal
        }
    });

    $("#tbTag tbody").on("click", "tr", function (event) {
        var elementName = $(this).children(":nth-child(2)");
        if (event.target.className == 'fas fa-trash-alt') {
            bootbox.confirm({buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },message: "Bạn chắc chắn muốn xóa thẻ mục này chứ?", callback: (result) =>{
                if (result) {
                    deleteTag(elementName.text());
                }
            },centerVertical: true})
        }
    })

    $("#tbPost tbody").on("click", "tr", function (event) {
        var elementState = $(this).children(":nth-child(5)");
        var elementTitle = $(this).children(":nth-child(2)");

        if (event.target.className == 'fas fa-edit') {
            var selectOption = [];
            ['Tạm lưu', 'Chờ duyệt', 'Đã duyệt', 'Đã xuất bản', 'Từ chối'].forEach(text => {
                if (text != elementState.text()) selectOption.push({value: text, text: text});
            })
            bootbox.prompt({ 
                title: "Chỉnh sửa trạng thái bài viết",
                inputOptions: selectOption,
                inputType: 'select',
                callback: function(result){ 
                    if (result) {
                        updatePostState(elementTitle.attr('idpost'), result);
                    }
                },
                centerVertical: true
            });
        }else if (event.target.className == 'fas fa-trash-alt') {
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
                    deletePost(elementTitle.attr('idpost'));
                }
            },centerVertical: true})
        }
    })

    $("#tbUser tbody").on("click", "tr", function (event) {
        var elementRole = $(this).children(":nth-child(3)");
        var elementName = $(this).children(":nth-child(2)");

        if (event.target.className == 'fas fa-edit') {
            if (elementRole.text() == 'Độc giả') {
                var remainDay = elementName.attr('remainDay');
                var selectOption = [{text: '3 Ngày', value: 3},
                                    {text: '7 Ngày', value: 7},
                                    {text: '10 Ngày', value: 10},
                                    {text: '14 Ngày', value: 14}];
                
                bootbox.prompt({
                    title: `Thời gian còn lại ${remainDay}, gia hạn thêm: `,
                    inputOptions: selectOption,
                    value: '3 Ngày',
                    inputType: 'select',
                    callback: function (result) {
                        if (result) {
                            updateUserStatus(elementName.attr('iduser'), {remainDay: result});
                        }
                    },
                    centerVertical: true
                });
            } else if (elementRole.text() == 'Biên tập viên') {
                var category = JSON.parse(elementName.attr('category'));
                updateEditorModal(category, allCategory);
                $("#userEditor").attr('iduser', elementName.attr('iduser'));
                $("#userEditor").modal('show');

            } else if (elementRole.text() == 'Thông thường') {
                var selectOption = [{text: 'Phóng viên', value: UserRole.WRITER},
                                    {text: 'Độc giả', value: UserRole.SUBSCRIBER},
                                    {text: 'Biên tập viên', value: UserRole.EDITOR},
                                    {text: 'Quản trị viên', value: UserRole.ADMIN}];
                
                bootbox.prompt({
                    title: `Phân quyền:`,
                    inputOptions: selectOption,
                    // value: 'Biên tập viên',
                    inputType: 'select',
                    callback: function (result) {
                        if (result) {
                            updateUserStatus(elementName.attr('iduser'), {role: result});
                        }
                    },
                    centerVertical: true
                });
            }
        }else if (event.target.className == 'fas fa-trash-alt') {
            bootbox.confirm({buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },message: "Bạn chắc chắn muốn xóa tài khoản này chứ?", callback: (result) =>{
                if (result) {
                    deleteUser(elementName.attr('iduser'));
                }
            },centerVertical: true})
        }else if (event.target.className == 'fas fa-eye') {
            updateUserInfoModal(elementName.attr('iduser'));
            $("#userEditor").modal('show');
        }

    })

    $("#newCategorySubmit").click(function (event) {
        $("#newCategoryForm").hide();
        $.ajax({
            url: '/api/admin/category?action=create',
            type: 'POST',
            data: $('#newCategoryForm').serialize() + token,
            success: function (res) {
                Message('Thêm chuyên mục thành công,vui lòng tải lại trang!', true);
                updateCategoryTable(null);
                getAllCategory();
            },
            error: function (res) {
                Message('Thêm chuyên mục thất bại! ' + res.responseText, false);
            }
        });
    });

    $("#newTagSubmit").click(function (event) {
        $("#newTagForm").hide();
        $.ajax({
            url: '/api/admin/tag',
            type: 'POST',
            data: $('#newTagForm').serialize() + token,
            success: function (res) {
                Message('Thêm thẻ thành công!', true);
                updateTagTable();
            },
            error: function (res) {
                Message('Thêm thẻ thất bại! ' + res.responseText, false);

            }
        });
    });

    $('#applyEditorCat').click(function (event) {
        var listSelect = []
        $.each($('#editorSelectCat option:selected'), (name, obj) => {
            listSelect.push($(obj).attr('idcat'));
        })
        var iduser = $("#userEditor").attr('iduser');
        var data = {id: iduser, category: listSelect, token: Cookies.get('token'), audience: navigator.userAgent};
        $.ajax({
            url: '/api/admin/user',
            type: 'POST',
            data: data,
            success: function (res) {
                $("#userEditor").modal('hide');
                numUpdate = maxUpdate - 1;
                updateUserTable();
                Message('Phân chuyên mục cho nhân viên thành công', true);
            },
            error: function (err) {
                $("#userEditor").modal('hide');
                Message('Không thể  phân chuyên mục cho nhân viên! ' + err, false);
            }
        })
    })
    
    
});

function updateUserStatus(iduser, data) {
    data.token = Cookies.get('token');
    data.id = iduser;
    data.audience = navigator.userAgent;
    $.ajax({
        url: '/api/admin/user',
        type: 'POST',
        data: data,
        success: function (res) {
            //Message('Cập nhật thành công!', true);
            numUpdate = maxUpdate - 1;
            updateUserTable();
        },
        error: function (res) {
            Message('Cập nhật thất bại! ' + res.responseText, false);

        }
    });
}

function deleteUser(iduser) {
    var data = {};
    data.token = Cookies.get('token');
    data.id = iduser;
    data.audience = navigator.userAgent;

    $.ajax({
        url: '/api/admin/user',
        type: 'DELETE',
        data: data,
        success: function (res) {
            //Message('Cập nhật thành công!', true);
            numUpdate = maxUpdate - 1;
            updateUserTable();
        },
        error: function (res) {
            Message('Xóa tài khoản thất bại! ' + res.responseText, false);

        }
    });
}

function updatePostState(idpost, state) {
    $.ajax({
        url: '/api/admin/post',
        type: 'POST',
        data: token + '&state='+ state + '&id=' + idpost,
        success: function (res) {
            //Message('Cập nhật thành công!', true);
            numUpdate = maxUpdate - 1;
            updatePostTable();
        },
        error: function (res) {
            Message('Cập nhật thất bại! ' + res.responseText, false);

        }
    });
}

function deletePost(idpost) {
    $.ajax({
        url: '/api/admin/post',
        type: 'DELETE',
        data: token + '&id='+ idpost,
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

function deleteTag(tagName) {
    $.ajax({
        url: '/api/admin/tag',
        type: 'DELETE',
        data: token +'&name=' + tagName,
        success: function (res) {
            Message('Xóa thẻ thành công!', true)
            updateTagTable();
        },
        error: function (res) {
            Message('Xóa thẻ thất bại! ' + res.responseText, false)
        }
    });
}

function updateCategory(newname, groupName) {
    if (oldCategoryValue == newname) {
        return;
    }
    var data = { oldname: oldCategoryValue, newname: newname, catGroup: groupName, token: Cookies.get('token'), audience: navigator.userAgent };
    $.ajax({
        url: '/api/admin/category?action=update',
        type: 'POST',
        data: data,
        success: function (res) {
            Message('Cập nhật chuyên mục thành công!', true);
            getAllCategory();
        },
        error: function (err) {
            Message('Cập nhật chuyên mục thất bại! ' + err.responseText, false);
            $("#tbCategory tbody tr").children(":nth-child(2)").text(oldCategoryValue);
        }
    })
}

function deleteCategory(elementName, elementGroup, elementParent) {
    var data = { catName: elementName.text(), catGroup: elementGroup.text(), token: Cookies.get('token'), audience: navigator.userAgent };
    $.ajax({
        url: '/api/admin/category?action=delete',
        type: 'POST',
        data: data,
        success: function (res) {
            Message('Xóa chuyên mục thành công!', true);
            elementParent.remove();
            getAllCategory();
        },
        error: function (err) {
            Message('Xóa chuyên mục thất bại! ' + err, false);
            $("#tbCategory tbody tr").children(":nth-child(2)").text(oldCategoryValue);
        }
    })
}

function createCatEl(data, indexNum) {
    var tr = document.createElement('tr');
    var index = document.createElement('td'); index.textContent = indexNum;
    var name = document.createElement('td'); name.textContent = data.name;

    var group = document.createElement('td'); group.textContent = data.group;
    var publish = document.createElement('td'); publish.textContent = data.post.publish;
    var approve = document.createElement('td'); approve.textContent = data.post.approve;
    var notapprove = document.createElement('td'); notapprove.textContent = data.post.other;
    var reject = document.createElement('td'); reject.textContent = data.post.reject;
    var action = document.createElement('td');
    action.innerHTML = `<td>
                        <a href="${data.url}" class="view" title="View" data-toggle="tooltip"><i class="fas fa-eye"></i></a>
                        <a href="#" class="edit" title="Edit" data-toggle="tooltip"><i class="fas fa-edit"></i></a>
                        <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                class="fas fa-trash-alt"></i></a>
                        </td>`;
    tr.append(index);
    tr.append(name);
    tr.append(group);
    tr.append(publish);
    tr.append(approve);
    tr.append(notapprove);
    tr.append(reject);
    tr.append(action);
    return tr;
}

function createTagEl(data, indexNum) {
    var tr = document.createElement('tr');
    var index = document.createElement('td'); index.textContent = indexNum;
    var name = document.createElement('td'); name.textContent = data.name;
    var numRef = document.createElement('td'); numRef.textContent = data.numReference;
    var action = document.createElement('td');
    var url = '/tag/' + data.name;
    action.innerHTML = `<td>
                        <a href="${url}" class="view" title="View" data-toggle="tooltip"><i class="fas fa-eye"></i></a>
                        <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                class="fas fa-trash-alt"></i></a>
                        </td>`;
    tr.append(index);
    tr.append(name);
    tr.append(numRef);
    tr.append(action);
    return tr;
}

function createPostEl(data, indexNum) {
    var tr = document.createElement('tr');
    var index = document.createElement('td'); index.textContent = indexNum;
    var title = document.createElement('td'); title.textContent = data.title;
    title.setAttribute('idpost', data.id);

    var category = document.createElement('td'); category.textContent = data.category;
    var author = document.createElement('td'); author.textContent = data.author;
    var state = document.createElement('td'); state.textContent = data.state;
    if (data.state == 'Tạm lưu') state.setAttribute('class', 'text-secondary');
    else if (data.state == 'Chờ duyệt') state.setAttribute('class', 'text-warning');
    else if (data.state == 'Đã duyệt') state.setAttribute('class', 'text-success');
    else if (data.state == 'Đã xuất bản') state.setAttribute('class', 'text-primary');
    else if (data.state == 'Từ chối') state.setAttribute('class', 'text-danger');
    else state.setAttribute('class', 'text-white bg-dark');
    state.setAttribute('style', 'font-weight:550');

    var publishDate = document.createElement('td'); publishDate.textContent = data.publishDate;
    var view = document.createElement('td'); view.textContent = data.view;
    var action = document.createElement('td');
    action.innerHTML = `<td>
                        <a href="${data.url}" class="view" title="View" data-toggle="tooltip"><i class="fas fa-eye"></i></a>
                        <a href="#" class="edit" title="Edit" data-toggle="tooltip"><i class="fas fa-edit"></i></a>
                        <a href="#" class="delete" title="Delete" data-toggle="tooltip"><i
                                class="fas fa-trash-alt"></i></a>
                        </td>`;
    tr.append(index);
    tr.append(title);
    tr.append(category);
    tr.append(author);
    tr.append(state);
    tr.append(publishDate);
    tr.append(view);
    tr.append(action);
    return tr;
}

function createUserEl(data, indexNum) {
    console.log(data);
    var tr = document.createElement('tr');
    var index = document.createElement('td'); index.textContent = indexNum;
    

    var name = document.createElement('td'); name.textContent = data.name;
    var role = document.createElement('td'); role.textContent = data.role;

    var joinDate = document.createElement('td'); joinDate.textContent = data.joinDate;
    var action = document.createElement('td');
    action.innerHTML = `<td>
                        <a class="view" title="View" data-toggle="tooltip"><i class="fas fa-eye"></i></a>
                        <a class="edit" title="Edit" data-toggle="tooltip"><i class="fas fa-edit"></i></a>
                        <a class="delete" title="Delete" data-toggle="tooltip"><i
                                class="fas fa-trash-alt"></i></a>
                        </td>`;
    if (data.role == 'Độc giả') {
        name.setAttribute('remainDay', data.remainDay);
    } else if (data.role == 'Biên tập viên') {
        name.setAttribute('category', JSON.stringify(data.category));
    }
    name.setAttribute('iduser', data.id);

    tr.append(index);
    tr.append(name);
    tr.append(role);
    tr.append(joinDate);
    tr.append(action);
    return tr;
}

function updateCategoryTable(sources) {
    if (!sources) sources = '/api/admin/category';
    updateTable(sources, '#pagination_category', "#tbCategory", createCatEl)
}

function updateTagTable(sources) {
    if (!sources) sources = '/api/admin/tag';
    updateTable(sources, '#pagination_tag', "#tbTag", createTagEl)

}

function updatePostTable(sources) {
    if (!sources) sources = '/api/admin/post?type=simple';
    updateTable(sources, '#pagination_post', "#tbPost", createPostEl)
}

function updateUserTable(sources) {
    if (!sources) sources = '/api/admin/user?type=simple';
    updateTable(sources, '#pagination_user', "#tbUser", createUserEl)
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
        totalNumberLocator: function(response) {
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
    if (typeof(sources) == "string") {
        if (sources.indexOf('?') == -1)
            options.dataSource = sources + '?token=' + Cookies.get('token') + "&audience=" + navigator.userAgent;
        else options.dataSource = sources + '&token=' + Cookies.get('token') + "&audience=" + navigator.userAgent;
    }
    $(pagination).pagination(options)
}

function getFormId(idBtn) {
    var match = /new(.*)Btn/g.exec(idBtn);
    return '#new' + match[1] + 'Form';
}

function getTypeFromId(idSearch) {
    var match = /search(.*)/g.exec(idSearch);
    return match[1];
}

function Message(msg, isSuccess) {
    bootbox.alert({
        message: msg,
        className: isSuccess?'border border-success': 'border border-danger',
        centerVertical: true
    })
}

function remainDayToNum(remainDay) {
    return remainDay.substring(0, remainDay.indexOf(' '));
}

function updateEditorModal(editorCategory, allCategory) {
    var container = $('#userEditor div[class="container"]');
    $('#userEditor h4[class="modal-title"]').text("Phân chuyên mục cho biên tập viên");
    var row = container.children('div');
    row.empty();
    var select = document.createElement('select');
    select.setAttribute('class', 'form-control');
    select.setAttribute('size', '7');
    select.setAttribute('id', 'editorSelectCat');
    select.multiple = true;
    
    allCategory.forEach(element => {
        var str = String(element.name);
        var option = document.createElement('option');
        option.innerHTML = str + ' - ' + element.group + '<i class="fas fa-check"></i>';
        option.setAttribute('idcat', element._id);
        if(editorCategory.find(e => {
            return e == element._id;
        })) {
            option.selected = true;
        }
        select.append(option);
    })

    row.append(select);
    $('#editorSelectCat').focus();
}

function updateUserInfoModal(userid) {

    

    $.ajax({
        url: '/api/admin/user' ,
        type: 'GET',
        data: {token: Cookies.get('token'), audience: navigator.userAgent, filter: {_id: userid}},
        success: (res) => {
            var container = $('#userEditor div[class="container"]');
            $('#userEditor h4[class="modal-title"]').text("Thông tin người dùng:");
            var row = container.children('div');
            row.empty();
            $(row).html(updateInfo(res.data[0]));
        },
        error: (res) => {
            Message('Không thể lấy thông tin người dùng ' + JSON.stringify(res), false);
        }
    });

    var updateInfo = (data) => {
        var favCat = [];
        if (!data.favoriteCategoty) data.favoriteCategoty = [];
        if (!data.activities) data.activities = [];
        data.favoriteCategoty.forEach(element => {
            var newEl = $("<a class='badge badge-dark badge-pill'></a>").text(element.name);
            newEl.attr('href', element.url);
            favCat.push(newEl);
        });
        var activities = [];
        data.activities.forEach(function (activity) {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.textContent = `<strong>Bạn</strong> ${activity.action} <a class="post-title"> ${activity.post}</a>`
            tr.appendChild(td);
            activities.append(tr);
        })
        data.role = roleToStr(data.role);
        var html = `<h5 class="mb-3" id=''><b>${data.username}</b></h5>
    <div class="row">
        <div class="col-md-6">
            <h6>Vai trò</h6>
            <p id=''>${data.role}</p>
            <h6>Email</h6>
            <p id=''>${data.email}</p>
            <h6>Ngày sinh</h6>
            <p id=''>${data.birthday}</p>
        </div>
        <div class="col-md-6">
            <h6 id='_info_favCat'>Chuyên mục quan tâm</h6>
            ${favCat}
            <hr>
            <span class="badge badge-primary" id=''>${data.likes}</span>
            <span class="badge badge-success" id=''>${data.comments}</span>
            <span class="badge badge-danger" id=''>${data.shares}</span>
        </div>
        <div class="col-md-12">
            <h5 class="mt-2"><span class="fa fa-clock-o ion-clock float-right"></span>Hoạt động
                gần đây</h5>
            <table class="table table-sm table-hover table-striped">
                <tbody id='_info_activity'>
                    ${activities}
                </tbody>
            </table>
        </div>
    </div>`;
    return html;
    }
}

function getAllCategory() {
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

function roleToStr(role) {
    if (role == UserRole.NORMAL) return 'Thông thường';
    if (role == UserRole.WRITER) return 'Phóng viên';
    if (role == UserRole.SUBSCRIBER) return 'Độc giả';
    if (role == UserRole.EDITOR) return 'Biên tập viên';
    if (role == UserRole.ADMIN) return 'Quản trị viên';
}