import _ from 'lodash'

export default {
  install(app) {
    // Globally register all `_base`-prefixed components inside `./components/base`
    const baseComponents = import.meta.glob('../components/base/*.vue', {
      eager: true
    })

    Object.entries(baseComponents).forEach(([path, module]) => {
      // Get the PascalCase version of the component name
      const componentName = _.upperFirst(
        _.camelCase(
          path
            .split('/')
            .pop()
            .replace(/\.\w+$/, '')
        )
      )

      // Register component globally
      app.component(`Base${componentName}`, module.default || module)
    })
  }
}
