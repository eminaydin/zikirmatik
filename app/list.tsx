import React from "react";
import { View, SectionList } from "react-native";
import { styles } from "../styles/list.styles";
import { useZikirList } from "../hooks/useZikirList";
import { ZikirAccordionItem } from "../components/ZikirAccordionItem";
import { ZikirSectionHeader } from "../components/ZikirSectionHeader";
import { CATEGORIZED_RECOMMENDATIONS } from "../constants/Recommendations";

export default function ListScreen() {
  const { t, expandedSections, toggleSection, selectZikir } = useZikirList();

  return (
    <View style={styles.container}>
      <SectionList
        sections={CATEGORIZED_RECOMMENDATIONS}
        renderItem={({ item, section, index }) => (
          <ZikirAccordionItem
            item={item}
            index={index}
            isExpanded={expandedSections.has(section.title)}
            onPress={() => selectZikir(item)}
            t={t}
          />
        )}
        renderSectionHeader={({ section }) => (
          <ZikirSectionHeader
            title={section.title}
            isExpanded={expandedSections.has(section.title)}
            onPress={() => toggleSection(section.title)}
            t={t}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}
