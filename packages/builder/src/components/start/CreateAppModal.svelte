<script>
  import { writable, get as svelteGet } from "svelte/store"
  import { notifications, Input, ModalContent, Dropzone } from "@budibase/bbui"
  import { store, automationStore } from "builderStore"
  import { API } from "api"
  import { apps, admin, auth } from "stores/portal"
  import analytics, { Events } from "analytics"
  import { onMount } from "svelte"
  import { goto } from "@roxi/routify"
  import { createValidationStore } from "helpers/validation/yup"
  import * as appValidation from "helpers/validation/yup/app"

  export let template

  const values = writable({ name: "", url: null })
  const validation = createValidationStore()
  $: validation.check($values)

  onMount(async () => {
    await setupValidation()
  })

  const setupValidation = async () => {
    const applications = svelteGet(apps)
    appValidation.name(validation, { apps: applications })
    appValidation.url(validation, { apps: applications })
    appValidation.file(validation, { template })
    // init validation
    validation.check($values)
  }

  async function createNewApp() {
    try {
      // Create form data to create app
      let data = new FormData()
      data.append("name", $values.name.trim())
      if ($values.url) {
        data.append("url", $values.url.trim())
      }
      data.append("useTemplate", template != null)
      if (template) {
        data.append("templateName", template.name)
        data.append("templateKey", template.key)
        data.append("templateFile", $values.file)
      }

      // Create App
      const createdApp = await API.createApp(data)
      analytics.captureEvent(Events.APP.CREATED, {
        name: $values.name,
        appId: createdApp.instance._id,
        templateToUse: template,
      })

      // Select Correct Application/DB in prep for creating user
      const pkg = await API.fetchAppPackage(createdApp.instance._id)
      await store.actions.initialise(pkg)
      await automationStore.actions.fetch()
      // Update checklist - in case first app
      await admin.init()

      // Create user
      await API.updateOwnMetadata({ roleId: $values.roleId })
      await auth.setInitInfo({})
      $goto(`/builder/app/${createdApp.instance._id}`)
    } catch (error) {
      console.error(error)
      notifications.error("Error creating app")
    }
  }

  // auto add slash to url
  $: {
    if ($values.url && !$values.url.startsWith("/")) {
      $values.url = `/${$values.url}`
    }
  }
</script>

<ModalContent
  title={"Create your app"}
  confirmText={template?.fromFile ? "Import app" : "Create app"}
  onConfirm={createNewApp}
  disabled={!$validation.valid}
>
  {#if template?.fromFile}
    <Dropzone
      error={$validation.touched.file && $validation.errors.file}
      gallery={false}
      label="File to import"
      value={[$values.file]}
      on:change={e => {
        $values.file = e.detail?.[0]
        $validation.touched.file = true
      }}
    />
  {/if}
  <Input
    bind:value={$values.name}
    error={$validation.touched.name && $validation.errors.name}
    on:blur={() => ($validation.touched.name = true)}
    label="Name"
    placeholder={$auth.user.firstName
      ? `${$auth.user.firstName}s app`
      : "My app"}
  />
  <Input
    bind:value={$values.url}
    error={$validation.touched.url && $validation.errors.url}
    on:blur={() => ($validation.touched.url = true)}
    label="URL"
    placeholder={$values.name
      ? "/" + encodeURIComponent($values.name).toLowerCase()
      : "/"}
  />
</ModalContent>
