<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'MainLayout',

  components: {},

  setup() {
    const options_default = {
      hideHistory: false,
      hidePrevious: false,
      hideAdvanced: false,
      hideQuick: false,
      enableDebug: false,
      default_roll: '1d10',
    };
    const leftDrawerOpen = ref(false);
    const options = useStorage('options', options_default);
    const router = useRouter()

    function handleReset() {
      options.value = { ...options_default };
    }

    return {
      options,
      leftDrawerOpen,
      router,
      handleReset,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<template>
  <q-layout view="lHh lpR fFf">
    <q-toolbar>
      <div class="col-1">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
      </div>

      <q-toolbar-title class="col-stretch text-h6" style="text-align: center">
        <span @click="router.push('/')">Randomly/Die</span>
      </q-toolbar-title>

      <div class="col-1">&nbsp;</div>
    </q-toolbar>

    <q-drawer show-if-above v-model="leftDrawerOpen" bordered class="rr-drawer">
      <q-list>
        <div style="float: right; vertical-align: top">
          <q-btn
            round
            flat
            dense
            icon="close"
            aria-label="Close Menu"
            @click="toggleLeftDrawer"
          ></q-btn>
        </div>
        <q-item-label header class="rr-drawer-header">
          <span>Options</span>
        </q-item-label>
        <q-item>
          <q-toggle
            v-model="options.hideQuick"
            label="Hide quick buttons"
            color="yellow"
          ></q-toggle>
        </q-item>
        <q-item>
          <q-toggle
            v-model="options.hidePrevious"
            label="Hide previous rolls"
            color="yellow"
          ></q-toggle>
        </q-item>
        <q-item>
          <q-toggle
            v-model="options.hideHistory"
            label="Hide history buttons"
            color="yellow"
          ></q-toggle>
        </q-item>
        <q-item>
          <q-toggle
            v-model="options.hideAdvanced"
            label="Hide advanced settings"
            color="yellow"
          ></q-toggle>
        </q-item>
        <q-item>
          <q-toggle
            v-model="options.enableDebug"
            label="Enable debug"
            color="red"
          ></q-toggle>
        </q-item>
        <q-item>
          <q-btn outline @click="handleReset">Reset</q-btn>
        </q-item>
      </q-list>
      <q-item clickable to="/modes">modes</q-item>
    </q-drawer>

    <q-page-container>
      <router-view :options="options" />
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">
.rr-drawer {
  background-color: $background !important;
  color: $text-default;
}
.rr-drawer-header {
  background-color: $primary;
  color: $text-default;
}
</style>
