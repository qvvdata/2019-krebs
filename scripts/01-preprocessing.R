library(tidyverse)
library(sf)
library(readxl)
library(geojsonio)
#Krebsprävalenz am 31.12.2015 nach Lokalisationen, Geschlecht und Alter - in % der Bevölkerung

# Statistik Austria
#[bev_fort_1197] Bevölkerung im Jahresdurchschnitt Q
#für Wohnbevölkerung im Jahresdurchschnitt, 2015
bezirke_mortalität_codes <- read_excel("input/bessereheader/krebssterblichkeit_wohnbez_geschl_seit1977.xlsx", sheet="CODE_Wohnbez")
mortalität_yearly <- read_excel("input/bessereheader/krebssterblichkeit_wohnbez_geschl_seit1977.xlsx", sheet="mortalitätsraten_jährlich")
bezirke_mortalität <- read_excel("input/bessereheader/krebssterblichkeit_wohnbez_geschl_seit1977.xlsx", sheet="Daten") %>%
  left_join(bezirke_mortalität_codes, by=c("wohnbezirk"="bezcode"))%>%
  gather(group, rate, gesamt_altersstandardisierte_rate:w_altersstandardisierte_rate) %>%
  rename(bezirkname=`wohnbezirk.y`)

# Überleben
ueberleben_stadium <- read_excel("input/bessereheader/relatives Überleben_Alter_Stadium_Grafiken.xlsx", sheet="Daten_Überleben_Stadium_2018")
ueberleben_alter <- read_excel("input/bessereheader/relatives Überleben_Alter_Stadium_Grafiken.xlsx", sheet="Daten_Überleben_Alter_2018")

# prävalenz
praevalenz_gesamt_absolut <- read_excel("input/bessereheader/praevalenz_2015.xlsx", sheet="Prävalenz_Personen_absolut")
krebsarten_alter_absolut <- read_excel("input/bessereheader/praevalenz_2015.xlsx", sheet="Prävalenz_Lokalisationen_absolu")
praevalenz_gesamt_pct <- read_excel("input/bessereheader/praevalenz_2015.xlsx", sheet="BevBezug_Personen_%")
krebsarten_alter_pct <- read_excel("input/bessereheader/praevalenz_2015.xlsx", sheet="BevBezug_Lok_%")
krebsarten_alter_pct_rel <- read_excel("input/bessereheader/praevalenz_2015.xlsx", sheet="Lok_%")
krebsarten_alter_bevref <- read_excel("input/bessereheader/praevalenz_2015.xlsx", sheet="bevö2015")

# geodaten laden
bez_18_mw <- read_sf("input/geo/bezirke2016_mitwienerbezirken_e-eu-rt-fusioniert.geojson") %>%
  mutate(GKZ=as.numeric(polbezirke)) %>%
  as('Spatial') %>%
  #ms_simplify(keep=0.5, keep_shapes = T) %>%
  st_as_sf()

bez_18_mw$BL <- substring(bez_18_mw$GKZ,0,1)
bundeslaendergrenzen <- bez_18_mw %>% group_by(BL) %>% summarise()

# Testen welche Bezirke nicht passen
bez_18_mw_test <- bez_18_mw %>%
  left_join(bezirke_mortalität_codes, by=c("GKZ"="bezcode")) %>% 
  select(polbezirke, GKZ) 

# ADd save hinzufügen

add_save <- function(p, filename) {
  ggsave(paste0("output/",filename,".png"), plot=p, width = 20, height = 10, units = "cm",
         bg = "transparent")
  ggsave(paste0("output/",filename,"_mobile.png"),plot=p, width = 20, height = 10, scale=0.25, units = "cm",
         bg = "transparent")
}

add_save_pdf <- function(p, filename) {
  ggsave(paste0("output/",filename,".pdf"), plot=p, width = 20, height = 10, units = "cm",
         bg = "transparent")
  ggsave(paste0("output/",filename,"_mobile.pdf"),plot=p, width = 20, height = 10, scale=0.25, units = "cm",
         bg = "transparent")
}

# Bezriksgrenzen laden
bezirksgrenzen_2016 <- read_sf("input/geo/bezirke_999_geo.json")
bezirksgrenzen_2016_e_eu_rt <- bezirksgrenzen_2016 %>%
  rename(GKZ=iso) %>%
  mutate(GKZ=case_when(GKZ %in% c("101","102","103") ~ "101", TRUE ~ GKZ),
         name=case_when(GKZ %in% c("101","102","103") ~ "Eisenstadt/Eisenstadt Umgebung/Rust", TRUE ~ name)) %>%
  group_by(GKZ,name) %>%
  summarise() %>%
  st_union(by_feature = T)

bezirksgrenzen_2016_e_eu_rt %>% topojson_write(file="interaktiv/karten/dist/bezirke_eeur.topojson")
