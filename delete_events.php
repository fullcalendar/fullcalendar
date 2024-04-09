<?php
include_once "config.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Assuming you pass event ID as a hidden input in the form
    $event_id = $_POST['event_id'];

    // Delete event from the database
    $sql = "DELETE FROM scheduled WHERE id = $event_id";

    if ($conn->query($sql) === TRUE) {
        echo "Event deleted successfully";
    } else {
        echo "Error deleting event: " . $conn->error;
    }
}

$conn->close();
?>
