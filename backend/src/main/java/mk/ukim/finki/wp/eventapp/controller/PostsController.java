package mk.ukim.finki.wp.eventapp.controller;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.wp.eventapp.model.Post;
import mk.ukim.finki.wp.eventapp.model.ScrapedDataDTO;
import mk.ukim.finki.wp.eventapp.service.PostService;
import mk.ukim.finki.wp.eventapp.service.PostServiceImpl;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:5173")
public class PostsController {
    private final PostService postService;

    @PostMapping
    public void sendToDatabase(@RequestBody List<ScrapedDataDTO> scrapedDataDTO) {
        postService.processScrapedData(scrapedDataDTO);
    }

    @GetMapping("/all")
    public List<Post> getScrapedData(){
        return postService.getScrapedData();
    }

    @GetMapping("/barName")
    public List<Post> getScrapedDataByBarName(@RequestParam String barName){
        System.out.println(barName);
        return postService.getScrapedDataByBarName(barName);
    }
}
