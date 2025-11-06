let db;
const request = indexedDB.open("BlueMobilesDB", 1);

request.onupgradeneeded = (e) => {
  db = e.target.result;
  const store = db.createObjectStore("mobiles", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = (e) => {
  db = e.target.result;
  displayMobiles();
};

request.onerror = (e) => console.error("DB error", e);

const form = document.getElementById("mobileForm");
form.addEventListener("submit", saveMobile);

function saveMobile(e) {
  e.preventDefault();
  const imagesInput = document.getElementById("images");
  const files = Array.from(imagesInput.files).slice(0, 5);

  const readerPromises = files.map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  });

  Promise.all(readerPromises).then(imagesData => {
    const transaction = db.transaction(["mobiles"], "readwrite");
    const store = transaction.objectStore("mobiles");

    const data = {
      model: document.getElementById("model").value,
      manufactureDate: document.getElementById("manufactureDate").value,
      buyingDate: document.getElementById("buyingDate").value,
      buyerNumber: document.getElementById("buyerNumber").value,
      buyingPrice: document.getElementById("buyingPrice").value,
      sellingDate: document.getElementById("sellingDate").value,
      soldToNumber: document.getElementById("soldToNumber").value,
      sellingPrice: document.getElementById("sellingPrice").value,
      tests: {
        speaker: document.getElementById("speakerTest").checked,
        microphone: document.getElementById("microphoneTest").checked,
        display: document.getElementById("displayTest").checked,
        battery: document.getElementById("batteryTest").checked,
        camera: document.getElementById("cameraTest").checked
      },
      images: imagesData
    };

    store.add(data);
    transaction.oncomplete = () => {
      form.reset();
      displayMobiles();
    };
  });
}

function displayMobiles() {
  const transaction = db.transaction(["mobiles"], "readonly");
  const store = transaction.objectStore("mobiles");
  const tbody = document.querySelector("#mobileList tbody");
  tbody.innerHTML = "";

  store.openCursor().onsuccess = function(e) {
    const cursor = e.target.result;
    if (cursor) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cursor.value.model}</td>
        <td>${cursor.value.buyingDate}</td>
        <td>${cursor.value.buyingPrice}</td>
        <td>${cursor.value.sellingDate || ""}</td>
        <td>${cursor.value.sellingPrice || ""}</td>
        <td>
          <button onclick="deleteMobile(${cursor.value.id})">Delete</button>
        </td>`;
      tbody.appendChild(row);
      cursor.continue();
    }
  };
}

function deleteMobile(id) {
  const transaction = db.transaction(["mobiles"], "readwrite");
  const store = transaction.objectStore("mobiles");
  store.delete(id).onsuccess = () => displayMobiles();
}
