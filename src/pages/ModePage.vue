<script setup lang="ts">
import { ref } from 'vue';
import { MODE } from 'src/lib/modes';
</script>

<template>
  <div class="row justify-center text-h5 q-pb-md">Modes</div>
  <div class="row justify-center q-gutter-md">
    <template v-for="(val, key) in MODE" :key="key">
      <q-card bordered class="rr-mode-card col-4">
        <q-card-section>
          <table class="rr-table">
            <tr>
              <td>Mode {{ val.id }}:</td>
              <td>
                {{ val.name }}
              </td>
            </tr>
            <tr>
              <td>Default Range:</td>
              <td>
                {{ val.override.zerobase ? '0' : '1' }} - {{ val.default_max }}
              </td>
            </tr>
            <tr v-if="val.number_base !== 10">
              <td>Number Base:</td>
              <td>
                {{ val.number_base }}
              </td>
            </tr>

            <tr v-if="val.override.exclusive || val.override.zerobase">
              <td>Flags:</td>
              <td>
                {{
                  [
                    val.override.exclusive ? 'Exclusive' : '',
                    val.override.zerobase ? 'Zero-base' : '',
                  ]
                    .filter((v) => v)
                    .join(', ') || 'None'
                }}
              </td>
            </tr>
            <tr>
              <td>Quick Buttons:</td>
              <td>
                {{ val.quick.map((v) => v.toString()).join(', ') || 'None' }}
              </td>
            </tr>
            <tr v-if="val.mappings">
              <td>Mapping:</td>
              <td>
                <table class="none">
                  <tr v-for="(val, key) in val.mappings" :key="key">
                  <td>{{key}}</td>
                  <td>{{val.join(', ')}}</td></tr>
                </table>
              </td>
            </tr>
          </table>
        </q-card-section>
      </q-card>
    </template>
  </div>
</template>

<style lang="scss">
.rr-mode-card {
  background-color: $background;
  border-color: $primary;
}

table.rr-table tr td:first-child {
  color: $primary;
  white-space: nowrap;
  vertical-align: top;
}

table.rr-table > tr:first-child {
  color: $secondary;
}
</style>
