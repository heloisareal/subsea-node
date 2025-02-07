document.getElementById("sshForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const host = document.getElementById("host").value;
    const port = document.getElementById("port").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!host || !port || !username || !password) {
        alert('Todos os campos devem ser preenchidos!');
        return;
    }

    const response = await fetch('/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host, port, username, password })
    });

    const result = await response.json();
    document.getElementById("output").textContent = result.message || result.error;

    if (result.host) {
        document.getElementById("connectionInfo").style.display = 'block';
        document.getElementById("connectionDetails").textContent = `IP: ${result.host}, Porta: ${result.port}`;
    }
});

document.getElementById("pingButton").addEventListener("click", async function() {
    const response = await fetch('/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    if (result.pingResult) {
        document.getElementById("pingResult").textContent = result.pingResult;
    } else {
        document.getElementById("pingResult").textContent = result.error;
    }
});

document.getElementById("downloadBtn").addEventListener("click", function() {
    window.location.href = '/download-ping';  // Baixar o arquivo .txt
});
