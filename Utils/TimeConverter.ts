export class TimeConverter {
    public static msToTime = (ms: number) => {
        ms = Date.now() - ms
        const seconds = Number((ms / 1000).toFixed(1))
        const minutes = Number((ms / (1000 * 60)).toFixed(1))
        const hours = Number((ms / (1000 * 60 * 60)).toFixed(1))
        const days = Number((ms / (1000 * 60 * 60 * 24)).toFixed(1))

        return ({
            seconds: seconds,
            minutes: minutes,
            hours: hours,
            days: days
        })
    }
}