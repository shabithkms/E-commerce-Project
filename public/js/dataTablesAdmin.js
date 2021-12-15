//Data tables

$(document).ready(function () {
    $('#adminTable').DataTable();
});

$('#adminTable tbody tr').each(function (idx) {
    $(this).children("td:eq(0)").html(idx + 1);
});

//Order table
$(document).ready(function () {
    $('#orderTable').DataTable();
});
$('#orderTable tbody tr').each(function (idx) {
    $(this).children("td:eq(0)").html(idx + 1);
});
//Product table
$(document).ready(function () {
    $('#proTable').DataTable();
});

$('#proTable tbody tr').each(function (idx) { 
    $(this).children("td:eq(0)").html(idx + 1); 
});

//Data export table
$(document).ready(function () {
    $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ]
    });
});

$('#example tbody tr').each(function (idx) {
    $(this).children("td:eq(0)").html(idx + 1);
});

$(document).ready(function () {
    $('#example1').DataTable();
});

$('#example1 tbody tr').each(function (idx) {
    $(this).children("td:eq(0)").html(idx + 1);
});

$(document).ready(function () {
    $('#report').DataTable();
});

