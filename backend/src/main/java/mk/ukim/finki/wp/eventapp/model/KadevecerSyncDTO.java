package mk.ukim.finki.wp.eventapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Payload sent by KadevecerScraper.py to /api/kadevecer/sync.
 * Field names match the scraper's JSON keys (snake_case).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KadevecerSyncDTO {
    private List<EventDTO> events;
    private List<ArtistDTO> artists;
    private List<VenueDTO> venues;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class VenueDTO {
        private String name;
        private String phone;
        private String category;
        private String city;
        private String kadevecer_url;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EventDTO {
        private String bar;
        private String post_url;
        private String caption;
        private String image_url;
        private String event_date;
        private String address;
        private List<String> artist_slugs;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ArtistDTO {
        private String slug;
        private String name;
        private String role;
        private String image_url;
        private String instagram;
        private String facebook;
        private String youtube;
        private String kadevecer_url;
    }
}
