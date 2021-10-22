
let storedData: { [index: string]: string | number } = {}

const parseMetricsTostore = (metrics: { fields: string | number }[]): void => {
    const readings = metrics.map((v: any) => v.fields)
    readings.forEach((element: any) => {
        storedData = { ...storedData, ...element }
    });
}

const SensorsService : {
    getStoredData: () => { [index: string]: string | number },
    parseMetricsTostore: (metrics: { fields: string | number }[]) => void
} = {
    getStoredData: () => storedData,
    parseMetricsTostore
}

export default SensorsService