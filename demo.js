var client;

function startConnect() {
  if (typeof Paho === "undefined" || !Paho.MQTT) {
    console.error("❌ Paho MQTT library not loaded!");
    updateStatus("❌ Paho MQTT library not loaded", false);
    return;
  }

  const host = document.getElementById("host").value;
  const port = Number(document.getElementById("port").value);
  const clientId = "clientId-" + Math.random().toString(16).substr(2, 8);

  console.log(`Connecting to wss://${host}:${port}/mqtt as ${clientId}`);
  client = new Paho.MQTT.Client(host, port, "/mqtt", clientId);

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
    useSSL: true,
    onSuccess: onConnect,
    onFailure: function (err) {
      console.error("❌ Connection failed:", err.errorMessage);
      updateStatus("❌ Connection Failed", false);
    }
  });
}

function onConnect() {
  console.log("✅ Connected");
  updateStatus("🟢 Connected", true);
  client.subscribe("water/#");
}

function onConnectionLost(response) {
  console.log("Connection lost:", response.errorMessage);
  updateStatus("🔴 Disconnected", false);
}

function onMessageArrived(message) {
  console.log(message.destinationName + ": " + message.payloadString);

  if (message.destinationName === "water/pH")
    document.getElementById("ph").innerText = message.payloadString;
  if (message.destinationName === "water/turbidity")
    document.getElementById("turbidity").innerText = message.payloadString;
  if (message.destinationName === "water/ammonia")
    document.getElementById("ammonia").innerText = message.payloadString;
  if (message.destinationName === "water/tds")
    document.getElementById("tds").innerText = message.payloadString;
  if (message.destinationName === "water/level")
    document.getElementById("level").innerText = message.payloadString + " %";
}

function startDisconnect() {
  if (client) {
    client.disconnect();
    console.log("Disconnected");
    updateStatus("🔴 Disconnected", false);
  }
}

function updateStatus(text, connected) {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = text;
  statusDiv.className = "status " + (connected ? "connected" : "disconnected");
}
