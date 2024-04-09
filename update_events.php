<?php

session_start(); // Start the session

include_once "config.php";

// Retrieve event details if available in session
if (isset($_SESSION['event_id'])) {
    $event_id = $_SESSION['event_id'];

    // Fetch event details from the database based on event ID
    $sql = "SELECT * FROM scheduled ";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $event = $result->fetch_assoc();
    } else {
        echo "Event not found";
    }
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['event_id'])) {
    $event_id = $_POST['event_id'];

    // Fetch other updated event details from the form
    $title = $_POST['title'];
    $start_datetime = $_POST['start_datetime'];
    $end_datetime = $_POST['end_datetime'];
    $description = $_POST['description'];

  
    // Update event in the database
    $sql = "UPDATE scheduled SET 
            title = '$title', 
            start_datetime = '$start_datetime', 
            end_datetime = '$end_datetime', 
            description = '$description' 
            WHERE id = '$event_id'"; // Assuming id is a string, so quoting $event_id

    if ($conn->query($sql) === TRUE) {
        echo "Event updated successfully";
    } else {
        echo "Error updating event: " . $conn->error;
    }
}
// After verifying form submission

$conn->close();
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Update Event</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <div class="container mt-5">
    <h1>Update Event</h1>
    <form action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="POST">
      <input type="hidden" name="event_id" value="<?php echo isset($event) ? $event['id'] : ''; ?>">
      <div class="mb-3">
        <label for="title" class="form-label">Event Title</label>
        <input type="text" class="form-control" id="title" name="title" value="<?php echo isset($event) ? $event['title'] : ''; ?>" required>
      </div>
      <div class="mb-3">
        <label for="start_datetime" class="form-label">Start Date and Time</label>
        <input type="datetime-local" class="form-control" id="start_datetime" name="start_datetime" value="<?php echo isset($event) ? date('Y-m-d\TH:i', strtotime($event['start_datetime'])) : ''; ?>" required>
      </div>
      <div class="mb-3">
        <label for="end_datetime" class="form-label">End Date and Time</label>
        <input type="datetime-local" class="form-control" id="end_datetime" name="end_datetime" value="<?php echo isset($event) ? date('Y-m-d\TH:i', strtotime($event['end_datetime'])) : ''; ?>" required>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" id="description" name="description" rows="3"><?php echo isset($event) ? $event['description'] : ''; ?></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Update Event</button>
    </form>
  </div>
  <script>
    
  </script>

  <!-- Bootstrap Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
