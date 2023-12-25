# 軟體環境

　　軟體的建設是關鍵，是這項專題的靈魂。[硬件](/#/researches/hardware)的基礎上。在「田野數據科學家」專題中，軟體開發扮演著核心角色，它是連接高精度感測器數據與用戶自然語言交互的橋樑。我們的努力主要集中在以下幾個方面：

1. **數據處理**：我們開發了專門的軟體來處理從各種感測器收集來的原始數據，並將它們轉化為易於理解和分析的格式。這包括溫度、濕度、光照等關鍵指標的即時監控。

2. **雲端整合**：我們將數據同步到雲端，這不僅使得數據可以遠程訪問，還為未來的機器學習模型提供了豐富的數據源。

3. **用戶介面**：我們設計了直觀的網站和用戶介面，讓用戶可以輕鬆地獲取即時數據和農場狀態，並且能夠在任何裝置上獲得最佳的瀏覽體驗。

4. **語音交互**：我們整合了先進的語音識別和自然語言處理技術，讓用戶可以用自然的對話方式與系統互動，這大大提升了系統的可用性和訪問性。

通過這些軟體開發的努力，我們不僅提高了農場管理的效率，還增強了系統對用戶需求的響應能力，使得「田野數據科學家」專題在智慧農業領域中獨樹一幟。

接下來，我們將詳細說明實現方法：

## 環境建置

　　本專題主要的**運算設備**是 Raspberry Pi（以下簡稱 RP），我們在它上面運行 Python 程式來完成所有數據蒐集、上傳、分析等操作。**系統**採用的是 RP OS，其內建了很多實用的庫，以及 Python，讓我們可以快速進入開發。

### 開發調試

　　Python 程式將運行在 RP 上，且 GPIO、SPIDev 相關庫，都需要在 RP 上進行測試，所以開發環境就得在 RP 上了。這是我們軟體開發面臨的第一個問題，如何在沒有任何外設的 RP 上進行開發作業？

#### 購買外設

這就需要點經費了，且如果購賣便宜的螢幕、鍵盤、滑鼠，可能還不好用，畢竟也是要花很多時間開發的，這個不會是最佳方案。

#### 遠程調試

另一個替代方案就是遠程調試了，透過一台電腦操作另一台電腦，

### RP 程式

#### 標準庫

Python 有很實用且強大的標準庫，不用安裝就可以引用使用，先列出我們所使用到的標準庫及其作用：

```python
import time  # 用於訪問時間相關的功能，如等待 (sleep)
import datetime  # 提供處理日期和時間的類和函數
import multiprocessing  # 使多進程並行執行，利用多核處理器的功能
from operator import itemgetter  # 從序列中提取元素，常用於排序等操作
import asyncio  # 支持異步I/O，事件循環，協程等的庫
import tempfile  # 生成臨時文件和目錄的模組
```

Python

#### GPIO

RP 要接收感測器訊號， 需要連接 GPIO 接口，Python GPIO 庫就是必須的。

#### DHT

我們採用的空氣溫濕度感應器型號是 DHT22，DHT 官方提供了 API，可以讓我們更方便的讀取 DHT22 的數位訊號，使用 `Adafruit_DHT.DHT22` 就可以快速取用。

首先，當然是先安裝 `Adafruit-DHT`，DHT11、DHT22 都可以使用：

```bash
pip install Adafruit-DHT
```

bash・安裝方法來自 [PyPI](https://pypi.org/project/Adafruit-DHT/)

引入到 Python 中：

```python
import Adafruit_DHT
```

Python

以下是使用方法：

```python
DHTSensor = Adafruit_DHT.DHT22  # 指定感應器類型和 GPIO 引腳
DHTPin = 4  # 感測器 GPIO 腳位
humidity, temperature = Adafruit_DHT.read_retry(DHTSensor, DHTPin)  # 讀取溫濕度訊號
```

Python・此方法參考自 [《溫溼度感測器DHT11 - 樹莓派與傳感器》](https://s761111.gitbook.io/raspi-sensor/du-gan-qi-dht11)

#### SPI Dev

SPI 可以讓我們接收來自 MCP3008 的數位訊號。

安裝：

```bash
pip install spidev
```

bash

引用：

```python
import spidev
```

Python

接收 MCP3008 的數位訊號，還需要一個函式來讀取：

```python
# 讀取 SPI 腳位訊號
# channel 是感測器接到 MCP3008 的腳位 0~7
def ReadChannel(channel):
    adc = spi.xfer2([1, (8 + channel) << 4, 0])
    data = ((adc[1] & 3) << 8) + adc[2]
    return data
```

Python・此函數來自[《樹莓派：類比轉數位處理 - 樹莓派與傳感器》](https://s761111.gitbook.io/raspi-sensor/pai-bi-wei-li)

要懂這段程式，須了解 MCP3008 的資料交換機制以及 Python 的位元運算方法，所以我也沒有完全懂，但我們只要知道使用方法。

## 雲端資料庫

　　資料是我們軟體運作的原料，必然需要個倉庫來存放，並且要盡可能讓援練的存取更加方便。雲端是我們找到的最佳方案，只要有網路，到哪都可以存取，只要設定存取權限，也可以安全地存放。

　　Google Firebase 是我們選擇的方案，它提供免費的流量額度，對於中小項目非常實用，可以用來部署網站，還有非常易用的雲端資料庫 Firestore，以及可以儲存媒體的 Storage。

要在 Python 上使用並不難，首先安裝 `firebase-admin`：

```bash
pip install firebase-admin
```

bash

引用和初始化：

```python
# 引用
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# 初始化
cred = credentials.Certificate(".agriscientist-ai-firebase-adminsdk-8rn1p-65d123ccaf.json")
firebase_admin.initialize_app(cred)
db = firestore.client()
```

Python・方法來自 Firebase

> `agriscientist-ai-firebase-adminsdk-8rn1p-65d123ccaf.json` 是 Firebase admin 的驗證文件，可以在 Firebase 控制台中取得。

## 資訊即時展示

別急啦...
