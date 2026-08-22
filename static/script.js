document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const links = document.querySelectorAll('.nav-link');
    const tabs = document.querySelectorAll('.tab-content');
    const pageTitle = document.getElementById('page-title');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const tabId = 'tab-' + link.dataset.tab;
            tabs.forEach(t => t.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');

            pageTitle.textContent = link.textContent.replace('[', '').replace(']', '').toLowerCase()
                                    .replace(/^./, str => str.toUpperCase());
        });
    });

    // Formatting helpers
    const pad = (n) => n.toString().padStart(2, '0');
    const formatUptime = (seconds) => {
        const d = Math.floor(seconds / (3600*24));
        const h = Math.floor(seconds % (3600*24) / 3600);
        const m = Math.floor(seconds % 3600 / 60);
        const s = Math.floor(seconds % 60);
        return `${pad(d)}:${pad(h)}:${pad(m)}:${pad(s)}`;
    };

    const generateBar = (percent, length = 12) => {
        const filled = Math.round((percent / 100) * length);
        return '█'.repeat(filled) + '░'.repeat(length - filled);
    };

    let previousNetStats = {};
    let lastNetTime = Date.now();

    // Data fetching loops
    async function updateStatus() {
        if (!document.getElementById('tab-status').classList.contains('active')) return;
        try {
            const res = await fetch('/api/status');
            const data = await res.json();
            
            document.getElementById('uptime-display').textContent = `UPTIME: ${formatUptime(data.uptime)}`;
            
            document.getElementById('status-cpu-val').textContent = `${Math.round(data.cpu)}%`;
            document.getElementById('status-cpu-cores').textContent = `${data.cpu_cores} CORES`;
            document.getElementById('status-cpu-bar').innerHTML = `<span class="text-primary">${generateBar(data.cpu)}</span>`;
            
            document.getElementById('status-mem-val').textContent = `${Math.round(data.mem_percent)}%`;
            document.getElementById('status-mem-text').textContent = `${data.mem_used}/${data.mem_total}GB`;
            document.getElementById('status-mem-bar').innerHTML = `<span class="text-secondary">${generateBar(data.mem_percent)}</span>`;
            
            document.getElementById('status-disk-val').textContent = `${Math.round(data.disk_percent)}%`;
            document.getElementById('status-disk-bar').innerHTML = `<span style="color: var(--on-surface)">${generateBar(data.disk_percent)}</span>`;
            
            document.getElementById('status-temp-val').textContent = `${Math.round(data.temp)}°C`;
            document.getElementById('status-temp-bar').innerHTML = `<span class="text-error">${generateBar(Math.min(100, data.temp/100*100))}</span>`;
            
        } catch (e) {
            console.error(e);
        }
    }

    async function updateResources() {
        if (!document.getElementById('tab-resources').classList.contains('active')) return;
        try {
            const res = await fetch('/api/resources');
            const data = await res.json();

            const avgLoad = (data.cpu_per_core.reduce((a,b)=>a+b, 0) / data.cpu_per_core.length).toFixed(1);
            document.getElementById('res-cpu-load').textContent = `LOAD: ${avgLoad}%`;
            document.getElementById('res-cpu-freq').textContent = `FREQ: ${data.freq}GHz`;
            
            let c1 = '', c2 = '';
            data.cpu_per_core.forEach((p, i) => {
                const bar = `[${generateBar(p, 10)}] ${Math.round(p)}%`;
                const el = `<span>CORE${i}: <span style="color:var(--on-surface-variant);">${bar}</span></span>`;
                if (i < data.cpu_per_core.length / 2) c1 += el;
                else c2 += el;
            });
            document.getElementById('res-cpu-cores-1').innerHTML = c1;
            document.getElementById('res-cpu-cores-2').innerHTML = c2;

            document.getElementById('res-mem-total').textContent = `TOTAL: ${data.mem.total}GB`;
            document.getElementById('res-mem-used').textContent = `USED: ${data.mem.used}GB`;
            document.getElementById('res-mem-free').textContent = `FREE: ${data.mem.free}GB`;
            document.getElementById('res-mem-bar').style.width = `${data.mem.percent}%`;
            document.getElementById('res-mem-pct').textContent = `${Math.round(data.mem.percent)}%`;
            
            document.getElementById('res-swap-bar').style.width = `${data.swap.percent}%`;
            document.getElementById('res-swap-pct').textContent = `${Math.round(data.swap.percent)}%`;

            document.getElementById('res-mem-cache').textContent = `CACHE: ${data.mem.cache.toFixed(1)}GB`;
            document.getElementById('res-mem-buffers').textContent = `BUFFERS: ${data.mem.buffers.toFixed(1)}GB`;

            const diskList = document.getElementById('res-disk-list');
            diskList.innerHTML = '';
            const colors = ['var(--primary-fixed)', 'var(--secondary-fixed)', 'var(--on-surface-variant)'];
            data.partitions.forEach((p, i) => {
                const color = colors[i % colors.length];
                diskList.innerHTML += `
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; color: var(--on-surface);">
                        <span>${p.device} <span style="color:${color}">(${p.mountpoint})</span></span>
                        <span>${p.used}G / ${p.total}G</span>
                    </div>
                    <div style="font-family: monospace; letter-spacing: 2px; color: ${color}; opacity: 0.8;">
                        [${generateBar(p.percent, 20)}] ${Math.round(p.percent)}%
                    </div>
                </div>`;
            });
            
        } catch(e) {
            console.error(e);
        }
    }

    async function updateProcesses() {
        if (!document.getElementById('tab-processes').classList.contains('active')) return;
        try {
            const res = await fetch('/api/processes');
            const data = await res.json();
            
            const list = document.getElementById('process-list');
            list.innerHTML = '';
            
            data.processes.forEach((p, i) => {
                const isTop = i === 0;
                list.innerHTML += `
                <div class="table-row ${isTop ? 'highlight-row' : ''}">
                    <div ${isTop ? 'style="font-weight:bold"' : ''}>${p.pid}</div>
                    <div style="overflow: hidden; text-overflow: ellipsis;">${p.username || 'sys'}</div>
                    <div style="text-align: right; ${isTop ? 'font-weight:bold' : ''}">${(p.cpu_percent || 0).toFixed(1)}</div>
                    <div style="text-align: right;">${(p.memory_percent || 0).toFixed(1)}</div>
                    <div style="padding-left: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; ${!isTop ? 'color: var(--on-surface)' : ''}">${p.name}</div>
                </div>`;
            });
            
            document.getElementById('proc-tasks').textContent = data.total_tasks;
            if (data.load_avg.length >= 3) {
                document.getElementById('proc-load').textContent = `${data.load_avg[0].toFixed(2)} ${data.load_avg[1].toFixed(2)} ${data.load_avg[2].toFixed(2)}`;
            }

            // Dummy CPU/MEM bars for process tab header
            const r1 = Math.random() * 40 + 40;
            const r2 = Math.random() * 60 + 20;
            const html = `
            <div style="display: flex; gap: 4px;">
                <span style="width: 32px; color: var(--on-surface-variant);">CPU1</span>
                <span style="color: var(--primary-fixed);">[${generateBar(r1, 20)}] ${r1.toFixed(1)}%</span>
            </div>
            <div style="display: flex; gap: 4px;">
                <span style="width: 32px; color: var(--on-surface-variant);">CPU2</span>
                <span style="color: var(--error);">[${generateBar(r2, 20)}] ${r2.toFixed(1)}%</span>
            </div>
            <div style="display: flex; gap: 4px;">
                <span style="width: 32px; color: var(--on-surface-variant);">MEM</span>
                <span style="color: var(--secondary-fixed);">[${generateBar(30, 20)}]</span>
            </div>`;
            document.getElementById('proc-bars').innerHTML = html;

        } catch(e) {
            console.error(e);
        }
    }

    async function updateNetwork() {
        if (!document.getElementById('tab-network').classList.contains('active')) return;
        try {
            const res = await fetch('/api/network');
            const data = await res.json();
            
            const now = Date.now();
            const elapsed = (now - lastNetTime) / 1000;
            lastNetTime = now;

            const container = document.getElementById('network-interfaces');
            container.innerHTML = '';
            
            data.interfaces.forEach(iface => {
                let rxSpeed = 0, txSpeed = 0;
                
                if (previousNetStats[iface.name]) {
                    const prev = previousNetStats[iface.name];
                    rxSpeed = (iface.bytes_recv - prev.bytes_recv) / elapsed;
                    txSpeed = (iface.bytes_sent - prev.bytes_sent) / elapsed;
                }
                
                previousNetStats[iface.name] = iface;
                
                const formatSpeed = (bytes) => {
                    if (bytes > 1024*1024) return (bytes / (1024*1024)).toFixed(1) + ' MB/s';
                    if (bytes > 1024) return (bytes / 1024).toFixed(1) + ' KB/s';
                    return Math.max(0, bytes).toFixed(0) + ' B/s';
                };
                
                const formatTotal = (bytes) => {
                    if (bytes > 1024*1024*1024) return (bytes / (1024*1024*1024)).toFixed(2) + ' GB';
                    return (bytes / (1024*1024)).toFixed(2) + ' MB';
                };

                // Add random jitter to TX/RX bar length for visual appeal
                const rxPct = Math.min(100, (rxSpeed / (1024 * 1024 * 10)) * 100 + Math.random()*5);
                const txPct = Math.min(100, (txSpeed / (1024 * 1024 * 10)) * 100 + Math.random()*5);
                
                container.innerHTML += `
                <div style="margin-bottom: 16px; border-bottom: 1px solid var(--surface-variant); padding-bottom: 8px;">
                    <div style="display: flex; justify-content: space-between; color: var(--primary-fixed); font-weight: bold; margin-bottom: 8px;">
                        <span>${iface.name}</span>
                        <span style="color: var(--on-surface-variant); font-weight: normal; font-size: 10px;">ERR: ${iface.errin}/${iface.errout}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                        <span style="color: var(--on-surface-variant);">RX (Down): <span style="color: var(--secondary-fixed)">${formatSpeed(rxSpeed)}</span></span>
                        <span style="color: var(--on-surface-variant);">Total: ${formatTotal(iface.bytes_recv)}</span>
                    </div>
                    <div style="font-family: monospace; letter-spacing: 2px; color: var(--secondary-fixed); margin-bottom: 8px; font-size: 12px; white-space: nowrap; overflow: hidden;">
                        [${generateBar(rxPct, 30)}]
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 12px;">
                        <span style="color: var(--on-surface-variant);">TX (Up): <span style="color: var(--primary-fixed)">${formatSpeed(txSpeed)}</span></span>
                        <span style="color: var(--on-surface-variant);">Total: ${formatTotal(iface.bytes_sent)}</span>
                    </div>
                    <div style="font-family: monospace; letter-spacing: 2px; color: var(--primary-fixed); font-size: 12px; white-space: nowrap; overflow: hidden;">
                        [${generateBar(txPct, 30)}]
                    </div>
                </div>`;
            });
            
        } catch(e) {
            console.error(e);
        }
    }

    // Refresh loops
    setInterval(updateStatus, 1500);
    setInterval(updateResources, 2000);
    setInterval(updateProcesses, 2500);
    setInterval(updateNetwork, 1000);

    // Initial calls
    updateStatus();
    updateResources();
    updateProcesses();
    updateNetwork();
});
