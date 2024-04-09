<?php
// Start PHP session
session_start();

include_once "config.php";

// Step 3: Retrieve added event from the database
$sql = "SELECT * FROM scheduled"; // Assuming 'id' is the primary key
$result = $conn->query($sql);

$calendar_events = []; // Array to store events for the calendar

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $calendar_events[] = [
            'id' => $row['id'], // Store event ID
            'title' => $row['title'],
            'start' => $row['start_datetime'],
            'end' => $row['end_datetime'],
            'description' => $row['description']
        ];
    }
} else {
    echo "No events found";
}

// Store calendar events in session
$_SESSION['calendar_events'] = $calendar_events;

// Step 5: Output formatted event data
echo "<script>const events = " . json_encode($calendar_events) . ";</script>";

?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Calendar with Events</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- FullCalendar CSS -->
  <link href='https://cdn.jsdelivr.net/npm/fullcalendar/main.min.css' rel='stylesheet' />
</head>
<body>
<div class="container mt-5">
    <h1>Calendar with Events</h1>
<!-- Button to toggle add event form -->
<button id="addEventBtn" class="btn btn-primary mt-3">Add Event</button>

<!-- ADD EVENTS -->
<div id="eventForm" style="display: none;">
    <h2>Add Event</h2>
    <!-- Form for adding new event -->
    <form action="add_event.php" method="POST">
        <div class="mb-3">
            <label for="title" class="form-label">Event Title</label>
            <input type="text" class="form-control" id="title" name="title" required>
        </div>
        <div class="mb-3">
            <label for="start_datetime" class="form-label">Start Date and Time</label>
            <input type="datetime-local" class="form-control" id="start_datetime" name="start_datetime" required>
        </div>
        <div class="mb-3">
            <label for="end_datetime" class="form-label">End Date and Time</label>
            <input type="datetime-local" class="form-control" id="end_datetime" name="end_datetime" required>
        </div>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea class="form-control" id="description" name="description" rows="3"></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</div>

    <div id='calendar'></div>

    <div class="mt-5">
      <h2>Upcoming Events</h2>
      <div class="row">
        <?php foreach ($calendar_events as $event): ?>
        <div class="col-md-4">
          <div class="card mb-3">
            <div class="card-body">
              <!-- Display event details -->
              <h5 class="card-title"><?php echo $event['title']; ?></h5>
              <p class="card-text">Start: <?php echo $event['start']; ?></p>
              <p class="card-text">End: <?php echo $event['end']; ?></p>
              <p class="card-text"><?php echo $event['description']; ?></p>
              <!-- Form for update and delete actions -->
              <div class="d-flex justify-content-between">
                <form action="update_events.php" method="POST">
                  <input type="hidden" name="event_id" value="<?php echo $event['id']; ?>">
                  <button type="submit" class="btn btn-primary">Update</button>
                </form>
                <form action="delete_events.php" method="POST">
                  <input type="hidden" name="event_id" value="<?php echo $event['id']; ?>">
                  <button type="submit" class="btn btn-danger">Delete</button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <?php endforeach; ?>
      </div>
    </div>
  </div>

  <!-- Bootstrap Bundle with Popper -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <!-- FullCalendar JavaScript -->
  <script src='https://cdn.jsdelivr.net/npm/fullcalendar/main.min.js'></script>
  <script>

    document.addEventListener('DOMContentLoaded', function() {
      const calendarEl = document.getElementById('calendar')
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: events // Pass the fetched events data to the calendar
      })
      calendar.render()

      const addEventBtn = document.getElementById('addEventBtn');
      const eventForm = document.getElementById('eventForm');

      addEventBtn.addEventListener('click', function() {
        if (eventForm.style.display === 'none') {
          eventForm.style.display = 'block';
        } else {
          eventForm.style.display = 'none';
        }
      });
    });

  </script>
</body>
</html>

<style>
  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica Neue, Helvetica, sans-serif;
    font-size: 14px;
  }

  #calendar {
    max-width: 1100px;
    margin: 40px auto;
  }
</style>
