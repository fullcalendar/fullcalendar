<?php
include_once "config.php";

// Step 2: Insert event into the scheduled table
$start_datetime = $_POST['start_datetime']; // Assuming you receive this from a form
$end_datetime = $_POST['end_datetime']; // Assuming you receive this from a form
$title = $_POST['title']; // Assuming you receive this from a form
$description = $_POST['description']; // Assuming you receive this from a form

$sql = "INSERT INTO scheduled (start_datetime, end_datetime, title, description) 
        VALUES ('$start_datetime', '$end_datetime', '$title', '$description')";

if ($conn->query($sql) === TRUE) {
    echo "New event added successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

?>;