import React, { Component, PropTypes } from 'react'

import Knex from 'knex'

import Sidebar from './Sidebar'
import LanguageSelect from './LanguageSelect'
import Fork from './Fork'

export default class Container extends Component {

  static propTypes = {
    children: PropTypes.node.isRequired
  };

  static childContextTypes = {
    knexSubscribe: PropTypes.func.isRequired,
    runKnex: PropTypes.func.isRequired
  };

  state = {
    language: 'mysql'
  };

  registry = new Set();

  changeLanguage = (language) => {
    this.setState({ language }, this.initKnex)
  };

  initKnex() {
    this.knex = Knex({client: this.state.language})
    this.knex.client.transacting = true
    this.trx = this.knex
    window.knex = this.knex
    this.registry.forEach(component => component.forceUpdate())
  }

  componentWillMount() {
    if (typeof window !== 'undefined') {
      window.Knex = Knex
      this.initKnex()
    }
  }

  knexSubscribe = component => {
    this.registry.add(component)
    return () => this.registry.remove(component)
  };

  runKnex = code => {
    let output
    try {
      const blocks = code.split('\n\n')
      blocks[blocks.length - 1] = `return (${blocks[blocks.length - 1]}).toString()`
      output = new Function('knex', 'trx', blocks.join('\n\n'))(this.knex, this.trx)
    } catch (e) {
      output = {error: e.message}
    }
    return output
  };

  getChildContext() {
    return {
      knexSubscribe: this.knexSubscribe,
      runKnex: this.runKnex
    }
  }

  render() {
    const {state: { language }, props: { children }} = this
    return (
      <div>
        {/* Sidebar */}
        <Sidebar sections={children} />

        {/* Select Language */}
        <LanguageSelect
          language={language}
          changeLanguage={this.changeLanguage} />

        {/* Fork Me */}
        <Fork {...this.props} />

        {/* Container elements */}
        <div className="container">
          {children}
        </div>

      </div>
    )
  }
}
