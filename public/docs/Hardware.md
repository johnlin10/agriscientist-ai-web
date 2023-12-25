# 硬體環境

硬體部分是「田野數據科學家」專題中不可或缺的基石，它是實現智慧農業的物理基礎。

接下來，我們會來詳細說明我們在硬體的選擇上，經過了哪些考量，以及這些硬體如何協作：

## Raspberry Pi 4B 8GB

　　最初，在我們還沒有明確專題方向時，我們在選擇主控上有些難以決定，因為我們需要對成本效益做出最佳考量，避免主控性能過剩。不過很快，在明確目標後，我們就將目光鎖定在了 Raspberry Pi（以下簡稱 RP）。其擁有出色的性能以及擴展性，也有廣大的開發者社群提供支援，GPIO 接口也支持常用的感測器。系統的選擇上也很多元，不過為了方便開發，RP OS 是非常好的選擇。

![Raspberry Pi 4B](https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2FRaspberryPi.png?alt=media&token=88f964d5-f0ae-4508-9f0a-69cfc9fa8405)

## MCP3008

　　有許多感測器都是模擬訊號，而 RP 都是數位接腳（GPIO），所以 RP 無法直接讀取訊號。

　　我們首先想到的是 Arduino 可以讀取模擬訊號，打算將其與 RP 結合，將數位化的數據傳輸給 RP，再由 RP 來處理。想法很簡單，執行起來就困難了。要使 RP 與 Arduino 建立雙向溝通，i2c 會是最常用的解決方案，但是在開發時，遇到很多關於傳輸的問題，並且一直沒有找到解決方法，延誤了很多時間，我們索性尋找下一個解決方案。

　　在網路上搜索，就可以看到一個非常廣泛使用的方法：MCP 3008 晶片。它是一個將模擬訊號轉換為數位訊號的晶片，有 8 路輸入，並連接特定接腳，由 RP 使用 Python `spidev` 庫讀取及轉換數值（詳見 [軟體環境-環境建置-RP程式-SPI Dev](/#/researches/software)）

## 感測器

　　感測器就像是專題的感官，讀取這些感測數據可以讓電腦知道農場環境情況，並加以分析。以下來介紹此專題所使用到的感測器：

### 溫濕度感測器

　　原本我們已經擁有一個 DHT11 溫濕度感測器，感測精度為 1℃，只能說夠用。但是我們希望獲得更加精確的數值，這樣對於未來的數據分析會有更好的精確度，提供更精準的建議。所以我們採購了 DHT22，精度來到 0.1℃。

以下是 DHT22 的規格：

|規格|參數|
|----|----|
|重量|4g|
|工作電壓|3V~5.5V|
|連接埠|數位雙向單匯流排|
|溫度範圍|-40~80℃ ±0.5℃|
|濕度範圍|20~90%RH ±2%RH|
|分辨率|0.1℃|

### 土壤濕度感測器

![土壤濕度感測器](https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2FsoilHumidity.jpg?alt=media&token=5e57c81c-25e3-405b-a4a0-3ac192cddbf3)

　　植物種在土上，土是植物的養分、水分的重要來源，土壤的濕度就會是一個評量農作物生長環境的重要指標之一。

> 這個土壤濕度感測器沒有特定型號，因為它的構造非常簡單，幾條接觸線、一個電晶體、幾個貼片電感。所以有很多小廠都在做，我們也無法確定我們擁有的這個是來自哪家生產的。
但是這不影響使用，**數值在後期可用算法調整**。

### 光照度感測器

![光照度感測器](https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2Flight.jpg?alt=media&token=8213a28c-a3a2-46ef-9ed3-d73e76034c20)

　　陽光可以說是萬物之源，對地球上的任何生物、植物都是非常重要到能量來源。光照度會是植物的重要參考。

### 水位感測器

![水位感測器](https://firebasestorage.googleapis.com/v0/b/agriscientist-ai.appspot.com/o/assets%2Fimages%2Fwater.jpg?alt=media&token=5b665404-efaf-4765-b4fd-eb40e6399e4a)

## MicroFarm

![MicroFarm](https://fakeimg.pl/800x600/ffffff/?text=MicroFarm)

## 電路連接

![電路連接](https://fakeimg.pl/900x500/ffffff/?text=Circuit%20Connections)
