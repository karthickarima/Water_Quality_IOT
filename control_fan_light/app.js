var client;
let reconnectTimer = null;
let isManuallyDisconnected = false;

window.onload = () => {
  connectMQTT();
};

function connectMQTT() {
  if (typeof Paho === "undefined" || !Paho.MQTT) {
    console.error("❌ MQTT library not loaded!");
    updateStatus("❌ MQTT library missing", false);
    return;
  }

  const host = document.getElementById("host").value;
  const port = Number(document.getElementById("port").value);
  const clientId = "clientId-" + Math.random().toString(16).substr(2, 8);

  // Clean old connection
  if (client && client.isConnected()) {
    client.disconnect();
  }

  client = new Paho.MQTT.Client(host, port, "/mqtt", clientId);

  client.onConnectionLost = function (response) {
    console.log("❌ Connection lost:", response.errorMessage);

    if (!isManuallyDisconnected) {
      updateStatus("🟠 Reconnecting...", false);

      reconnectTimer = setTimeout(() => {
        connectMQTT();
      }, 3000);
    }
  };

  client.connect({
    useSSL: true,
    timeout: 5,

    onSuccess: () => {
      console.log("✅ Connected");
      updateStatus("🟢 Connected", true);
    },

    onFailure: (err) => {
      console.log("❌ Connect failed:", err.errorMessage);
      updateStatus("🟠 Reconnecting...", false);

      reconnectTimer = setTimeout(() => {
        connectMQTT();
      }, 3000);
    }
  });
}

// SEND RELAY COMMAND
function controlRelay(topic, value) {
  if (!client || !client.isConnected()) {
    alert("❌ Not connected. Reconnecting...");
    connectMQTT();
    return;
  }

  const msg = new Paho.MQTT.Message(value.toString());
  msg.destinationName = topic;

  client.send(msg);

  console.log("📡 Sent:", topic, value);
}

// MANUAL DISCONNECT
function manualDisconnect() {
  isManuallyDisconnected = true;

  if (client && client.isConnected()) {
    client.disconnect();
  }

  clearTimeout(reconnectTimer);
  updateStatus("🔴 Disconnected", false);
}

// STATUS UI
function updateStatus(text, connected) {
  const statusDiv = document.getElementById("status");
  statusDiv.innerText = text;
  statusDiv.className = "status " + (connected ? "connected" : "disconnected");
}
