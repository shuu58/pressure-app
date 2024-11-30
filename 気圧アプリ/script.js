const apiKey = 'ace729892a4b6d10ea495c8a7b7980a0'; // OpenWeatherMapのAPIキー

// ボタンをクリックしたときに、選ばれた都市の気圧を取得する
document.getElementById('getPressureButton').addEventListener('click', function() {
    const selectedCity = document.getElementById('citySelect').value;  // 選ばれた都市を取得
    getCurrentPressure(selectedCity);  // 気圧を取得
    getForecast(selectedCity);         // 6時間ごとの気圧予報を取得
});

// 現在の気圧を取得する関数
async function getCurrentPressure(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('ネットワークの応答が正常ではありません');
        }

        const data = await response.json();
        if (data.cod !== 200) {
            throw new Error(data.message);
        }

        const pressure = data.main.pressure; // 気圧を取得
        const displayCityName = getCityName(city); // 都市名の表示名を取得
        document.getElementById('currentPressure').textContent = `${displayCityName}の現在の気圧: ${pressure} hPa`;
    } catch (error) {
        console.error('気圧の取得に失敗しました:', error);
        document.getElementById('currentPressure').textContent = `エラー: ${error.message}`;
    }
}

// 6時間ごとの気圧予報を取得する関数
async function getForecast(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
        if (!response.ok) {
            throw new Error('ネットワークの応答が正常ではありません');
        }

        const data = await response.json();
        const forecastList = data.list.filter((_, index) => index % 2 === 0).slice(0, 8); // 6時間ごとのデータを取得（3日分）

        const forecastContainer = document.getElementById('forecastList');
        forecastContainer.innerHTML = ''; // 以前のデータをクリア

        const labels = [];
        const pressures = [];

        forecastList.forEach(forecast => {
            const pressure = forecast.main.pressure; // 気圧
            const dateTime = new Date(forecast.dt * 1000).toLocaleString(); // 日時
            labels.push(dateTime);
            pressures.push(pressure);
            
            const listItem = document.createElement('li');
            listItem.textContent = `${dateTime}: 気圧: ${pressure} hPa`;
            forecastContainer.appendChild(listItem);
        });

        // グラフを描画
        drawPressureChart(labels, pressures);
    } catch (error) {
        console.error('天気予報の取得に失敗しました:', error);
        document.getElementById('forecastList').textContent = `エラー: ${error.message}`;
    }
}

// グラフを描画する関数
function drawPressureChart(labels, pressures) {
    const ctx = document.getElementById('pressureChart').getContext('2d');

    // すでにグラフが存在している場合は破棄する
    if (window.pressureChart instanceof Chart) {
        window.pressureChart.destroy();  // Chartインスタンスを破棄
    }

    // 新しいグラフを作成
    window.pressureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '気圧 (hPa)',
                data: pressures,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '気圧 (hPa)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日時'
                    }
                }
            }
        }
    });
}


// 都市名を取得する関数（表示用）
function getCityName(city) {
    const cityNames = {
        "Kanazawa,JP": "金沢",
        "Tokyo,JP": "東京",
        "Nagoya,JP": "名古屋"
    };
    return cityNames[city] || city;
}

// フォームのデータを処理
document.getElementById('painForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const pressure = document.getElementById('pressure').value;
    const headache = document.getElementById('headache').value;

    const listItem = document.createElement('li');
    listItem.textContent = `気圧: ${pressure} hPa, 頭痛: ${headache}`;
    document.getElementById('dataList').appendChild(listItem);

    this.reset();
});
