import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase'

const useCollectionAllDocData = (collectionPath) => {
  const [combinedData, setCombinedData] = useState([])

  useEffect(() => {
    // 创建对集合的引用
    const collectionRef = collection(db, collectionPath)
    // 创建查询（如果需要的话）
    const q = query(collectionRef)

    // 监听整个集合的变更
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // 用来存储所有文档数据的数组
        let documents = []

        snapshot.forEach((doc) => {
          // 这里我们假设每个文档的数据结构都是相似的，并且都含有一个名为 'data' 的字段
          // 如果不是这样，请根据您的数据结构进行调整
          const rawData = doc.data().data
          const formattedData = rawData.map((item) => ({
            ...item,
            soilHumidity: parseFloat(item.soilHumidity),
            temperature: parseFloat(item.temperature),
            humidity: parseFloat(item.humidity),
            light: parseInt(item.light, 10),
            water: parseInt(item.water, 10),
          }))

          // 将当前文档的数据添加到数组中
          documents = documents.concat(formattedData)
        })

        // 更新状态以包含所有文档的数据
        setCombinedData(documents)
      },
      (error) => {
        console.error('Failed to subscribe to collection:', error)
      }
    )

    // 清理函数
    return () => unsubscribe()
  }, [collectionPath])

  return combinedData
}

export default useCollectionAllDocData
