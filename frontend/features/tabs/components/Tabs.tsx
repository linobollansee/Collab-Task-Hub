import { TabsContent, TabsHeader, TabsMenu } from '@/features/tabs/components/index';
import { useStoreTabs } from '@/features/tabs/store/use-store-tabs';

const Tabs = () => {
  const { tabs, activeTabIndex, setActiveIndex } = useStoreTabs();

  return (
    <section className="p-8 font-sans text-gray-900">
      <TabsHeader>Project Menu</TabsHeader>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 ">
        <TabsMenu
          setActiveContentIndex={setActiveIndex}
          content={tabs}
          activeContentIndex={activeTabIndex}
        />
        <TabsContent content={tabs} activeContentIndex={activeTabIndex} />
      </div>
    </section>
  );
};

export default Tabs;
