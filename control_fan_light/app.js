let client = null;
let reconnectTimer = null;
let isManuallyDisconnected = false;

// AUTO CONNECT
window.onload = () => {
  connectMQTT();
};

function connectMQTT() {
  let host = document.getElementById("host").value;
  let port = Number(document.getElementById("port").value);

  updateStatus("connecting");
  let clientId = "web_" + Math.floor(Math.random() * 1000);
  client = new Paho.MQTT.Client(host, port, "/mqtt", clientId);


  client.onConnectionLost = function () {
    console.log("❌ Connection lost");

    if (!isManuallyDisconnected) {
      updateStatus("reconnecting");

      reconnectTimer = setTimeout(() => {
        connectMQTT();
      }, 3000);
    }
  };

  client.connect({
    timeout: 5,
    useSSL: true,

    onSuccess: () => {
      console.log("✅ Connected");
      updateStatus("connected");
    },

    onFailure: () => {
      console.log("❌ Connect failed:", err.errorMessage);
      updateStatus("reconnecting");

      reconnectTimer = setTimeout(() => {
        connectMQTT();
      }, 3000);
    }
  });
}

// MANUAL CONNECT
function manualConnect() {
  isManuallyDisconnected = false;
  connectMQTT();
}

// MANUAL DISCONNECT
function manualDisconnect() {
  isManuallyDisconnected = true;

  if (client && client.isConnected()) {
    client.disconnect();
  }

  clearTimeout(reconnectTimer);
  updateStatus("disconnected");
}

// STATUS HANDLER
function updateStatus(state) {
  let status = document.getElementById("status");

  status.classList.remove("connected", "disconnected", "reconnecting");

  if (state === "connected") {
    status.innerHTML = "🟢 Connected";
    status.classList.add("connected");

  } else if (state === "connecting") {
    status.innerHTML = "🔵 Connecting...";
    status.classList.add("reconnecting");

  } else if (state === "reconnecting") {
    status.innerHTML = "🟠 Reconnecting...";
    status.classList.add("reconnecting");

  } else {
    status.innerHTML = "🔴 Disconnected";
    status.classList.add("disconnected");
  }
}

// RELAY CONTROL
function controlRelay(topic, value) {
  if (!client || !client.isConnected()) {
    alert("❌ Not connected. Reconnecting...");
    connectMQTT();
    return;
  }

  let msg = new Paho.MQTT.Message(value.toString());
  msg.destinationName = topic;

  client.send(msg);

  console.log("📡 Sent:", topic, value);
}
