let client = null;
let reconnectTimeout = null;

// AUTO CONNECT ON LOAD
window.onload = () => {
  connectMQTT();
};

// MAIN CONNECT FUNCTION
function connectMQTT() {
  let host = document.getElementById("host").value;
  let port = Number(document.getElementById("port").value);

  client = new Paho.MQTT.Client(host, port, "web_" + Math.floor(Math.random()*1000));

  client.onConnectionLost = function () {
    console.log("❌ Connection lost");
    updateStatus("reconnecting");

    // Auto reconnect after 3 sec
    reconnectTimeout = setTimeout(() => {
      connectMQTT();
    }, 3000);
  };

  client.connect({
    timeout: 5,
    reconnect: false, // we handle manually
    onSuccess: () => {
      console.log("✅ Connected");
      updateStatus("connected");
    },
    onFailure: () => {
      console.log("❌ Connect failed");
      updateStatus("reconnecting");

      reconnectTimeout = setTimeout(() => {
        connectMQTT();
      }, 3000);
    }
  });
}

// MANUAL CONNECT
function manualConnect() {
  if (!client || !client.isConnected()) {
    connectMQTT();
  }
}

// MANUAL DISCONNECT
function manualDisconnect() {
  if (client && client.isConnected()) {
    client.disconnect();
  }
  clearTimeout(reconnectTimeout);
  updateStatus("disconnected");
}

// STATUS UI
function updateStatus(state) {
  let status = document.getElementById("status");

  if (state === "connected") {
    status.innerHTML = "🟢 Connected";
    status.className = "status connected";
  } else if (state === "reconnecting") {
    status.innerHTML = "🟠 Reconnecting...";
    status.className = "status reconnecting";
  } else {
    status.innerHTML = "🔴 Disconnected";
    status.className = "status disconnected";
  }
}

// RELAY CONTROL
function controlRelay(topic, value) {
  if (!client || !client.isConnected()) {
    alert("❌ Not connected. Trying reconnect...");
    connectMQTT();
    return;
  }

  let message = new Paho.MQTT.Message(value.toString());
  message.destinationName = topic;

  client.send(message);

  console.log("📡 Sent:", topic, value);
}