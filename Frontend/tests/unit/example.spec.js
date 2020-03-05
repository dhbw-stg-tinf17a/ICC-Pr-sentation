import { shallowMount, createLocalVue } from '@vue/test-utils';
import Buefy from 'buefy';
import VueRouter from 'vue-router';
import Navbar from '@/components/Navbar.vue';

const localVue = createLocalVue();
localVue.use(Buefy);
localVue.use(VueRouter);


describe('HelloWorld.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'new message';
    const wrapper = shallowMount(Navbar, {
      localVue,
      propsData: { msg },
    });
    expect(wrapper.text()).toMatch('Commute  Travel  Restaurant  Trainer');
  });
});
