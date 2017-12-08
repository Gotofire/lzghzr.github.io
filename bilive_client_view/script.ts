/// <reference path="options.ts" />
namespace App {
  let options = new App.Options()
    , optionsInfo: App.optionsInfo
    , loginDiv = <HTMLDivElement>document.querySelector('#login')
    , optionDiv = <HTMLDivElement>document.querySelector('#option')
    , configDiv = <HTMLDivElement>document.querySelector('#config')
    , logDiv = <HTMLDivElement>document.querySelector('#log')
    , userDiv = <HTMLDivElement>document.querySelector('#user')
    , template = <HTMLDivElement>document.querySelector('#template')
  /**
   * 显示登录界面
   * 
   */
  function showLogin() {
    let pathInput = <HTMLInputElement>loginDiv.querySelector('#path input')
      , protocolInput = <HTMLInputElement>loginDiv.querySelector('#protocol input[type="text"]')
      , keepInput = <HTMLInputElement>loginDiv.querySelector('#protocol input[type="checkbox"]')
      , connectInput = <HTMLInputElement>loginDiv.querySelector('#connect input')
      , connectSpan = <HTMLSpanElement>loginDiv.querySelector('#connect span')
    connectInput.onclick = async () => {
      let protocols = [protocolInput.value]
      if (keepInput.checked) protocols.push('keep')
      let connected = await options.connect(pathInput.value, protocols)
      if (connected) {
        loginDiv.classList.add('hide')
        login()
      }
      else connectSpan.innerText = '连接失败'
    }
    loginDiv.classList.remove('hide')
  }
  /**
   * 登录成功
   * 
   */
  async function login() {
    let infoMSG = await options.getInfo()
    optionsInfo = infoMSG.data
    // 处理错误信息
    options.onerror = (event) => {
      alert(event.data)
    }
    options.onwserror = () => wsClose('连接发生错误')
    options.onwsclose = (event) => {
      try {
        let msg: message = JSON.parse(event.reason)
        wsClose('连接已关闭 ' + msg.msg)
      } catch (error) {
        wsClose('连接已关闭')
      }
    }
    await showConfig()
    await showUser()
    optionDiv.classList.remove('hide')
    showLog()
  }
  /**
   * 加载全局设置
   * 
   */
  async function showConfig() {
    let saveConfigInput = <HTMLInputElement>document.querySelector('#saveConfig')
      , configMSG = await options.getConfig()
      , config = configMSG.data
      , configDF = getConfigTemplate(config)
    // 保存全局设置
    saveConfigInput.onclick = async () => {
      let configMSG = await options.setConfig(config)
      if (configMSG.msg != null) alert(configMSG.msg)
      else {
        alert('保存成功')
        config = configMSG.data
        let configDF = getConfigTemplate(config)
        configDiv.innerText = ''
        configDiv.appendChild(configDF)
      }
    }
    configDiv.appendChild(configDF)
  }
  /**
   * 加载Log
   * 
   */
  async function showLog() {
    let logMSG = await options.getLog()
      , logs = logMSG.data
      , logDF = document.createDocumentFragment()
    logs.forEach(log => {
      let div = document.createElement('div')
      div.innerText = log
      logDF.appendChild(div)
    })
    options.onlog = data => {
      let div = document.createElement('div')
      div.innerText = data
      logDiv.appendChild(div)
    }
    logDiv.appendChild(logDF)
  }
  /**
   * 加载用户设置
   * 
   */
  async function showUser() {
    let addUserDiv = <HTMLInputElement>document.querySelector('#addUser')
      , userMSG = await options.getAllUID()
      , uidArray = userMSG.data
      , df = document.createDocumentFragment()
    for (let uid of uidArray) {
      let userDataMSG = await options.getUserData(uid)
        , userData = userDataMSG.data
        , userDF = getUserDF(uid, userData)
      df.appendChild(userDF)
    }
    // 添加新用户
    addUserDiv.onclick = async () => {
      let userDataMSG = await options.newUserData()
        , uid = userDataMSG.uid
        , userData = userDataMSG.data
        , userDF = getUserDF(uid, userData)
      userDiv.appendChild(userDF)
    }
    userDiv.appendChild(df)
  }
  /**
   * 新建用户模板
   * 
   * @param {string} uid 
   * @param {userData} userData 
   * @returns {DocumentFragment} 
   */
  function getUserDF(uid: string, userData: userData): DocumentFragment {
    let userTemplate = <HTMLTemplateElement>template.querySelector('#userTemplate')
      , clone = document.importNode(userTemplate.content, true)
      , userDataDiv = <HTMLDivElement>clone.querySelector('.userData')
      , userConfigDiv = <HTMLDivElement>clone.querySelector('.userConfig')
      , saveUserInput = <HTMLInputElement>clone.querySelector('.saveUser')
      , deleteUserInput = <HTMLInputElement>clone.querySelector('.deleteUser')
      , userConfigDF = getConfigTemplate(userData)
    userConfigDiv.appendChild(userConfigDF)
    // 保存用户设置
    saveUserInput.onclick = async () => {
      let userDataMSG = await options.setUserData(uid, userData)
      if (userDataMSG.msg != null) alert(userDataMSG.msg)
      else {
        alert('保存成功')
        userData = userDataMSG.data
        let userConfigDF = getConfigTemplate(userData)
        userConfigDiv.innerText = ''
        userConfigDiv.appendChild(userConfigDF)
      }
    }
    // 删除用户设置
    deleteUserInput.onclick = async () => {
      let userDataMSG = await options.delUserData(uid)
      if (userDataMSG.msg != null) alert(userDataMSG.msg)
      else {
        alert('删除成功')
        userDataDiv.remove()
      }
    }
    return clone
  }
  /**
   * 设置模板
   * 
   * @param {(config | userData)} config 
   * @returns {DocumentFragment} 
   */
  function getConfigTemplate(config: config | userData): DocumentFragment {
    let df = document.createDocumentFragment()
    for (let key in config) {
      let info = optionsInfo[key] || {}
        , configValue = config[key]
        , configTemplate = <HTMLTemplateElement>template.querySelector('#configTemplate')
        , clone = document.importNode(configTemplate.content, true)
        , descriptionDiv = <HTMLDivElement>clone.querySelector('.description')
        , tipDiv = <HTMLDivElement>clone.querySelector('.tip')
        , inputInput = <HTMLInputElement>clone.querySelector('input')
      switch (info.type) {
        case 'number':
          inputInput.type = 'text'
          inputInput.value = (<number>configValue).toString()
          inputInput.oninput = () => {
            config[key] = parseInt(inputInput.value)
          }
          break
        case 'numberArray':
          inputInput.type = 'text'
          inputInput.value = (<number[]>configValue).join(',')
          inputInput.oninput = () => {
            config[key] = inputInput.value.split(',').map(value => { return parseInt(value) })
          }
          break
        case 'string':
          inputInput.type = 'text'
          inputInput.value = (<string>configValue)
          inputInput.oninput = () => {
            config[key] = inputInput.value
          }
          break
        case 'boolean':
          inputInput.type = 'checkbox'
          inputInput.checked = <boolean>configValue
          inputInput.onchange = () => {
            config[key] = inputInput.checked
          }
          break
        default:
          break
      }
      descriptionDiv.innerText = info.description
      tipDiv.innerText = info.tip
      df.appendChild(clone)
    }
    return df
  }
  /**
   * 处理连接中断
   * 
   * @param {string} data 
   */
  function wsClose(data: string) {
    let connectSpan = <HTMLSpanElement>loginDiv.querySelector('#connect span')
    optionDiv.classList.add('hide')
    configDiv.innerText = ''
    logDiv.innerText = ''
    userDiv.innerText = ''
    connectSpan.innerText = data
    loginDiv.classList.remove('hide')
  }
  showLogin()
}