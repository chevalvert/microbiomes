import { derived } from 'utils/state'
export default signal => derived(signal, value => !value)
