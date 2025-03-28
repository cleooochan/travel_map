function fetchData(callback) {
  setTimeout(() => {
    console.log("Data received");
    callback(); // Calls the callback function after fetching data
  }, 2000);
}

function processData() {
  console.log("Processing data...");
}

// Calling fetchData and passing processData as a callback
fetchData(processData);
