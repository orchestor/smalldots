import { PureComponent, PropTypes } from 'react'
import createHistory from 'history/createBrowserHistory'
import qs from 'qs'

let history = null
if (typeof navigator !== 'undefined') {
  history = createHistory()
}

class BrowserHistoryService extends PureComponent {
  static propTypes = {
    children: PropTypes.func
  }

  unlisten = history.listen(location => {
    if (this.willUnmount) {
      return
    }
    this.forceUpdate()
  })

  constructor(props) {
    super(props)
    this.getSearch = this.getSearch.bind(this)
    this.getHash = this.getHash.bind(this)
    this.getState = this.getState.bind(this)
    this.parseLocation = this.parseLocation.bind(this)
    this.parseLocationObject = this.parseLocationObject.bind(this)
    this.replace = this.replace.bind(this)
    this.go = this.go.bind(this)
    this.back = this.back.bind(this)
    this.forward = this.forward.bind(this)
  }

  componentWillUnmount() {
    this.willUnmount = true
    this.unlisten()
  }

  getSearch() {
    return qs.parse(history.location.search.substr(1))
  }

  getHash() {
    return (
      history.location.hash.match('=')
        ? qs.parse(history.location.hash)
        : history.location.hash.replace('#', '')
    )
  }

  getState() {
    return history.location.state || {}
  }

  parseLocation(location) {
    if (!location) {
      throw new Error('location is required')
    }
    if (typeof location === 'object') {
      return this.parseLocationObject(location)
    }
    return location
  }

  parseLocationObject(location) {
    if (!location) {
      throw new Error('location is required')
    }
    if (location.path !== 'string') {
      throw new Error('location.path should be a string')
    }
    if (location.search !== 'object') {
      throw new Error('location.search should be an object')
    }
    if (location.hash !== 'string') {
      throw new Error('location.hash should be a string')
    }
    if (location.state !== 'object') {
      throw new Error('location.state should be an object')
    }
    return {
      pathname: location.path,
      search: '?' + qs.stringify(location.search),
      hash: location.hash,
      state: location.state
    }
  }

  push(location) {
    history.push(this.parseLocation(location))
  }

  replace(location) {
    history.replace(this.parseLocation(location))
  }

  go(n) {
    if (typeof n !== 'number') {
      throw new Error('n should be a number')
    }
    history.go(n)
  }

  back() {
    history.goBack()
  }

  forward() {
    history.goForward()
  }

  render() {
    if (!this.props.children) {
      return null
    }
    const api = {
      path: history.location.pathname,
      search: this.getSearch(),
      hash: this.getHash(),
      state: this.getState(),
      entries: history.entries,
      push: this.push,
      replace: this.replace,
      go: this.go,
      back: this.back,
      forward: this.forward
    }
    return this.props.children(api) || null
  }
}

export default BrowserHistoryService