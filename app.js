const URL = "./my_model/"; // เปลี่ยนเป็น path โมเดลของคุณ

let model, webcam, labelContainer, maxPredictions;
let webcamRunning = false;

// เริ่มต้นโหลดโมเดล + กล้อง
async function init() {
    if (webcamRunning) return; // ถ้ากล้องทำงานอยู่แล้วไม่ต้องรันซ้ำ

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const flip = true;
    webcam = new tmImage.Webcam(500, 500, flip);
    await webcam.setup();
    await webcam.play();
    webcamRunning = true;
    window.requestAnimationFrame(loop);

    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
}

// วนลูปกล้อง
async function loop() {
    if (!webcamRunning) return;
    webcam.update();
    await predict();
    window.requestAnimationFrame(loop);
}

// ทำนายและแสดงผลแบบ progress bar
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    labelContainer.innerHTML = "";

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability;

        // กล่องแสดงผล
        const predictionContainer = document.createElement("div");
        predictionContainer.className = "progress-bar-container";

        // ชื่อ class
        const label = document.createElement("div");
        label.textContent = className;
        label.style.fontWeight = "bold";
        label.style.marginBottom = "5px";

        // แถบ progress
        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";

        const progressBarFill = document.createElement("div");
        progressBarFill.className = "progress-bar-fill";
        progressBarFill.style.width = (probability * 100).toFixed(2) + "%";

        // สีตาม class
        if (className.toLowerCase() === "healthy") {
            progressBarFill.style.backgroundColor = "green";
        } else {
            progressBarFill.style.backgroundColor = "#ff3434";
        }

        progressBar.appendChild(progressBarFill);

        // ข้อความ % ด้านหลัง
        const progressText = document.createElement("div");
        progressText.className = "progress-text";
        progressText.textContent = (probability * 100).toFixed(2) + "%";

        // รวมทั้งหมดเข้ากล่อง
        predictionContainer.appendChild(label);
        predictionContainer.appendChild(progressBar);
        predictionContainer.appendChild(progressText);

        labelContainer.appendChild(predictionContainer);
    }
}


function stopWebcam() {
    if (webcam && webcam.webcam && webcam.webcam.srcObject) {
        // หยุด track ทุกตัวใน stream
        webcam.webcam.srcObject.getTracks().forEach(track => track.stop());
        webcamRunning = false;
        document.getElementById("webcam-container").innerHTML = "<p>📷 กล้องถูกปิดแล้ว</p>";
        labelContainer.innerHTML = "";
    }
}



