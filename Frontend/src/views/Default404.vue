<template>
  <div
    id="Default404"
    class="hero-body"
  >
    <h1>Uuuuuups. Diese Seite existiert nicht.</h1>
    <router-link
      class="router-link"
      :to="{name: 'landingPage'}"
    >
      <h2>Zurück zur Startseite</h2>
    </router-link>
  </div>
</template>
