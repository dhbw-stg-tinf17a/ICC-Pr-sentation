import Navbar from '@/components/Navbar.vue';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);

const router = new VueRouter();

describe('Navbar.vue', () => {
  it('renders navigation links', async () => {
    const wrapper = shallowMount(Navbar, { localVue, router });
    expect(wrapper.text()).toMatch('Commute  Travel  Restaurant  Trainer');
  });
});
