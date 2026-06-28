package mk.ukim.finki.wp.eventapp.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScrapedDataDTO {
    private String bar;
    private String post_url;
    private String caption;
}
