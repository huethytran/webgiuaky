var oldCategoryValue;
var baseHTMLmsg =`<div class="alert alert-_msgtype alert-dismissible" id="alert_success" style="margin-top: 10px;">
<button type="button" class="close" data-dismiss="alert">&times;</button>
<strong><i class="fas fa-check"></i>_msgcontent</strong>
</div>`;

$(document).ready(function () {
    $("#newCategoryForm").hide();
    $("#newCategoryBtn").click(function(event){
        $("#newCategoryForm").show();
    })
    $("newCategorySubmit").click(function(){
        $("#newCategoryForm").hide();

    })
    $("#tbCategory tbody tr").children(":nth-child(2)").keydown(function(event) {
        if (event.keyCode == 13) event.preventDefault();
    });
    $("#tbCategory tbody tr").children(":nth-child(2)").keyup(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            $(this).attr('contenteditable', 'false');
            $(this).removeClass('bg-warning');
        }
    })
    $("#tbCategory tbody tr").children(":nth-child(2)").focusout(function (event) {
        $(this).attr('contenteditable', 'false');
        $(this).removeClass('bg-warning');
        updateCategory($(this));
    })

    $("#tbCategory tbody tr").click(function(event) {
        // console.log(event.target.parentElement.getAttribute("row_id"));
        var elementName = $(this).children(":nth-child(2)");
        var elementGroup = $(this).children(":nth-child(3)");
        if (event.target.className == 'fas fa-edit') {
            if (elementName.attr('contenteditable') == 'true') {
                elementName.attr('contenteditable', 'false');
                elementName.removeClass('bg-warning');
                updateCategory(elementName);
                return;
            }
            elementName.attr('contenteditable', 'true');
            elementName.addClass('bg-warning').css('padding','5px');
            elementName.focus();
            oldCategoryValue = elementName.text();
        } else if (event.target.className == 'fas fa-trash-alt') {
            // Delete category
            deleteCategory(elementName, elementGroup, $(this));
        } else if (event.target.className == 'fas fa-eye') {
            // Update modal
            // Show modal
        }
        
        
    });
    $("#containerCategory .table-wrapper .clearfix .pagination").click(function (event){
        console.log(event.target.className);
        if (event.target.className == 'fa fa-angle-double-left') {
            if (!$(this).hasClass('disabled')) {
                var activePage = $(this).children('.active');
                var index = parseInt(activePage.text());
        }} else if (event.target.className == 'page-link') {
                console.log(event.target.innerText);
        }
    })
    $("#newCategorySubmit").click(function(event) {
        $.ajax({
            url: '/admin/category?action=create',
            type: 'POST',
            data: $('#newCategoryForm').serialize(),
            success: function(res) {
                var msg = baseHTMLmsg.replace('_msgtype', 'success')
                        .replace('_msgcontent','Thêm chuyên mục thành công,vui lòng tải lại trang!');
                $("#message").html(msg);
                console.log(res);

            },
            error: function(res) {
                var msg = baseHTMLmsg.replace('_msgtype', 'danger')
                        .replace('_msgcontent','Thêm chuyên mục thất bại! ' + res.responseText);
                $("#message").html(msg);
                console.log(res);

            }
        });
    });
 });

function updateCategory(elementName) {
    // console.log(elementName.text());
    var data = {oldname: oldCategoryValue, newname: elementName.text()};
    $.ajax({
        url: '/admin/category?action=update',
        type: 'POST',
        data: data,
        success: function(res) {
            var msg = baseHTMLmsg.replace('_msgtype', 'success')
                    .replace('_msgcontent','Cập nhật chuyên mục thành công!');
            $("#message").html(msg);
            console.log(res);
        },
        error: function(err) {
            var msg = baseHTMLmsg.replace('_msgtype', 'danger')
            .replace('_msgcontent','Cập nhật chuyên mục thất bại! ' + err.responseText);
            console.log(err);
            $("#message").html(msg);
            $("#tbCategory tbody tr").children(":nth-child(2)").text(oldCategoryValue);
        }
    })
}

function deleteCategory(elementName, elementGroup, elementParent) {
    var data = {catName: elementName.text(), catGroup: elementGroup.text()};
    $.ajax({
        url: '/admin/category?action=delete',
        type: 'POST',
        data: data,
        success: function(res) {
            var msg = baseHTMLmsg.replace('_msgtype', 'success')
                    .replace('_msgcontent','Xóa chuyên mục thành công!');
            $("#message").html(msg);
            elementParent.remove();
            console.log(res);
        },
        error: function(err) {
            var msg = baseHTMLmsg.replace('_msgtype', 'danger')
            .replace('_msgcontent','Xóa chuyên mục thất bại! ' + err);
            console.log(err);
            $("#message").html(msg);
            $("#tbCategory tbody tr").children(":nth-child(2)").text(oldCategoryValue);
        }
    })
}

function updateCategoryTable() {

}