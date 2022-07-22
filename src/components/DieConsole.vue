<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';
import { Die } from 'src/lib/die';
import { rollHistoryType } from './models';

interface Props {
  active: boolean;
  history: rollHistoryType[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'submit', data: rollHistoryType): void;
  (e: 'console-close'): void;
}>();

const console_active = ref(props.active);
const console_input = ref('');
const error_status = ref(false);
const console_error = ref('');

watch(console_error, () => {
  error_status.value = console_error.value !== '';
});

watch(
  () => props.active,
  () => (console_active.value = props.active)
);

watch(console_input, () => {
  console_input.value === '' ? (error_status.value = false) : null;
});

function onSubmit() {
  let new_die = props.history[0].die;
  let new_mode = props.history[0].mode;
  try {
    new_die = new Die(console_input.value);
    console_error.value = '';
  } catch {
    console_error.value = 'Invalid dice format. Try something like 3d6.';
  }
  console.log('handle console submit: ' + console_input.value);

  if (!console_error.value) {
    emit('submit', {
      die: new_die,
      display: [],
      mode: new_mode,
      label: console_input.value,
      time: new Date(),
    });
  }
}
</script>

<template>
  <q-dialog
    v-model="console_active"
    seamless
    position="bottom"
    ref="console_ref"
  >
    <div class="row console justify-center items-center">
      <div class="col-grow">
        <q-input
          placeholder="Dice hacking mode enabled..."
          hint="Your dice notation console is ready to serve."
          filled
          clearable
          autofocus
          outlined
          stack-label
          bottom-slots
          :error-message="console_error"
          :error="error_status"
          v-model="console_input"
          @keyup.enter="onSubmit"
          input-class="text-rrinput"
        >
          <template v-slot:prepend>
            <q-icon name="computer" color="primary" /> </template
        ></q-input>
      </div>
      <div style="margin-left: 1em">
        <div class="col">
          <div>
            <q-btn
              style="width: 100%"
              outline
              @click="$emit('console-close')"
              color="primary"
              >Esc</q-btn
            >
          </div>
          <div>
            <q-btn outline @click="onSubmit" color="primary">Enter</q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<style lang="scss">
.console {
  color: $text-default;
  background-color: $paper;
  border-radius: 4px;
  margin: 1em;
  padding: 1em;
  width: 80vw;
  border: 1px solid $background;
}
</style>
