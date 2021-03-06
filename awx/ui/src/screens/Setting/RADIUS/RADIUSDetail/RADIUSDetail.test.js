import React from 'react';
import { act } from 'react-dom/test-utils';
import { SettingsProvider } from 'contexts/Settings';
import { SettingsAPI } from 'api';
import {
  mountWithContexts,
  waitForElement,
} from '../../../../../testUtils/enzymeHelpers';
import { assertDetail } from '../../shared/settingTestUtils';
import mockAllOptions from '../../shared/data.allSettingOptions.json';
import RADIUSDetail from './RADIUSDetail';

jest.mock('../../../../api');

describe('<RADIUSDetail />', () => {
  let wrapper;

  beforeEach(() => {
    SettingsAPI.readCategory.mockResolvedValue({
      data: {
        RADIUS_SERVER: 'example.org',
        RADIUS_PORT: 1812,
        RADIUS_SECRET: '$encrypted$',
      },
    });
  });

  beforeEach(async () => {
    await act(async () => {
      wrapper = mountWithContexts(
        <SettingsProvider value={mockAllOptions.actions}>
          <RADIUSDetail />
        </SettingsProvider>
      );
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('initially renders without crashing', () => {
    expect(wrapper.find('RADIUSDetail').length).toBe(1);
  });

  test('should render expected tabs', () => {
    const expectedTabs = ['Back to Settings', 'Details'];
    wrapper.find('RoutedTabs li').forEach((tab, index) => {
      expect(tab.text()).toEqual(expectedTabs[index]);
    });
  });

  test('should render expected details', () => {
    expect(wrapper.find('Alert').prop('title')).toBe(
      'This feature is deprecated and will be removed in a future release.'
    );
    assertDetail(wrapper, 'RADIUS Server', 'example.org');
    assertDetail(wrapper, 'RADIUS Port', '1812');
    assertDetail(wrapper, 'RADIUS Secret', 'Encrypted');
  });

  test('should hide edit button from non-superusers', async () => {
    const config = {
      me: {
        is_superuser: false,
      },
    };
    await act(async () => {
      wrapper = mountWithContexts(
        <SettingsProvider value={mockAllOptions.actions}>
          <RADIUSDetail />
        </SettingsProvider>,
        {
          context: { config },
        }
      );
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
    expect(wrapper.find('Button[aria-label="Edit"]').exists()).toBeFalsy();
  });

  test('should display content error when api throws error on initial render', async () => {
    SettingsAPI.readCategory.mockRejectedValue(new Error());
    await act(async () => {
      wrapper = mountWithContexts(
        <SettingsProvider value={mockAllOptions.actions}>
          <RADIUSDetail />
        </SettingsProvider>
      );
    });
    await waitForElement(wrapper, 'ContentLoading', (el) => el.length === 0);
    expect(wrapper.find('ContentError').length).toBe(1);
  });
});
