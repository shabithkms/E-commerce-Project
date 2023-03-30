//1. User Block
//2. User Unblock
//3. Change Order status
//4. Delete product
//5. Delete brand
//6. Delete category
//7. Delete coupon

//1---------------------------
function blockUser(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to Block " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Blocked!',
                'User has been blocked.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//2)---------------------------------
function unblockUser(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to unblock " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Unblocked!',
                'User has been Unblocked.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//3--------------------------------
function changeStatus(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to change the order status",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes,Change'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Changed!',
                'Order status changed.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//4-----------------
function deleteproduct(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'product has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//5-----------------------------
function deleteBrand(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//6----------------------------------
function deleteCategory(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    var name = event.currentTarget.name;
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete " + name,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Brand has been deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}
//7----------------------------
function deleteCoupon(event) {
    event.preventDefault();
    var link = event.currentTarget.href;
    
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete ",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Coupon  deleted.',
                'success'
            )
            window.location = link;
        }
        else {
            return false;
        }
    })
}