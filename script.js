let ipAddress = "";
  let historyData = [];

  // STEP 1: Get IP
  async function getIP() {
    try {
      let res = await fetch("https://api.ipify.org?format=json");
      let data = await res.json();
      ipAddress = data.ip;
      document.getElementById("ip").innerText = ipAddress;
    } catch (err) {
      console.log("Error fetching IP:", err);
    }
  }
  // Manual Search by Pincode
function searchByPincode() {
  let pincode = document.getElementById("pincode-input").value.trim();
  if (pincode === "") {
    alert("Please enter a pincode");
    return;
  }
  getPostOffices(pincode);
}


  // STEP 2: Get User Info
  async function getUserDetails() {
    document.getElementById("start-section").style.display = "none";
    document.getElementById("details-section").style.display = "block";

    try {
      let res = await fetch(`https://ipinfo.io/${ipAddress}/geo`);
      let data = await res.json();

      document.getElementById("ip-details").innerText = data.ip;
      document.getElementById("city").innerText = data.city;
      document.getElementById("region").innerText = data.region;
      document.getElementById("org").innerText = data.org || "N/A";
      document.getElementById("hostname").innerText = data.hostname || "N/A";

      let loc = data.loc.split(",");
      let lat = loc[0], lon = loc[1];

      document.getElementById("map").src = `https://maps.google.com/maps?q=${lat},${lon}&z=15&output=embed`;

      // Show time
      document.getElementById("timezone").innerText = data.timezone;
      setInterval(() => {
        let options = { timeZone: data.timezone, hour: '2-digit', minute: '2-digit', second: '2-digit' };
        document.getElementById("datetime").innerText = new Date().toLocaleString("en-US", options);
      }, 1000);

      // Fetch post offices
      getPostOffices(data.postal);

    } catch (err) {
      console.log("Error fetching user info:", err);
    }
  }

  // STEP 3: Get Post Offices
  async function getPostOffices(pincode) {
    try {
      let res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      let data = await res.json();
      let offices = data[0].PostOffice;

      displayPostOffices(offices);

      // Save history
      historyData.push({ pincode, offices });
      renderHistory();

      // Search filter
      document.getElementById("search").addEventListener("input", function () {
        let val = this.value.toLowerCase();
        let filtered = offices.filter(o =>
          o.Name.toLowerCase().includes(val) || o.BranchType.toLowerCase().includes(val)
        );
        displayPostOffices(filtered);
      });

    } catch (err) {
      console.log("Error fetching post offices:", err);
    }
  }

  // STEP 4: Display Post Offices
  function displayPostOffices(offices) {
    let container = document.getElementById("post-offices");
    container.innerHTML = "";
    offices.forEach(o => {
      let div = document.createElement("div");
      div.className = "office";
      div.innerHTML = `
        <p><b>Name:</b> ${o.Name}</p>
        <p><b>Branch Type:</b> ${o.BranchType}</p>
        <p><b>Delivery Status:</b> ${o.DeliveryStatus}</p>
        <p><b>District:</b> ${o.District}</p>
        <p><b>Division:</b> ${o.Division}</p>
      `;
      container.appendChild(div);
    });
  }

  // STEP 5: History
  function renderHistory() {
    let list = document.getElementById("history-list");
    list.innerHTML = "";
    historyData.forEach((item, index) => {
      let div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `<span>Pincode: ${item.pincode}, Offices: ${item.offices.length}</span>`;
      list.appendChild(div);
    });
  }

  function clearHistory() {
    historyData = [];
    renderHistory();
  }

  getIP();